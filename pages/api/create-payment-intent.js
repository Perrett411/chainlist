import Stripe from 'stripe';
import { validatePromoCode, calculateDiscountedPrice } from '../../constants/promoCodes';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount, planId, planName, promoCode, userInfo } = req.body;

      let finalAmount = amount;
      let promoDetails = null;
      
      // Validate and apply promo code if provided
      if (promoCode) {
        const promoValidation = validatePromoCode(promoCode, userInfo);
        if (promoValidation.valid) {
          finalAmount = calculateDiscountedPrice(amount, promoValidation);
          promoDetails = {
            code: promoCode.toUpperCase(),
            discount: promoValidation.discount,
            duration: promoValidation.duration,
            originalAmount: amount,
            discountedAmount: finalAmount,
            savings: amount - finalAmount
          };
        } else {
          return res.status(400).json({ 
            error: 'Invalid promo code',
            details: promoValidation.error 
          });
        }
      }

      // Convert amount to cents for Stripe
      const amountInCents = Math.round(finalAmount * 100);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          planId,
          planName,
          originalAmount: amount.toString(),
          finalAmount: finalAmount.toString(),
          promoCode: promoCode || 'none',
          promoDiscount: promoDetails ? promoDetails.discount.toString() : '0',
          promoDuration: promoDetails ? promoDetails.duration.toString() : '0'
        },
        description: promoDetails 
          ? `${planName} - AI Financial Assistant Subscription (${promoDetails.code} applied: ${Math.round(promoDetails.discount * 100)}% off for ${promoDetails.duration} months)`
          : `${planName} - AI Financial Assistant Subscription`,
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        promoDetails: promoDetails,
        finalAmount: finalAmount,
        originalAmount: amount
      });
    } catch (error) {
      console.error('Stripe payment intent error:', error);
      res.status(500).json({ 
        error: 'Failed to create payment intent',
        details: error.message 
      });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}