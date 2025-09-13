import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { amount, planId, planName } = req.body;

      // Convert amount to cents for Stripe
      const amountInCents = Math.round(amount * 100);

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        metadata: {
          planId,
          planName,
        },
        description: `${planName} - AI Financial Assistant Subscription`,
      });

      res.status(200).json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
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