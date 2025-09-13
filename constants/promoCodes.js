// Promo codes configuration for X Chainlist AI subscriptions
export const PROMO_CODES = {
  'LAUNCH80': {
    id: 'LAUNCH80',
    name: 'Launch Special - 80% Off',
    discount: 0.80, // 80% discount
    duration: 2, // months
    validUntil: new Date('2025-12-31'), // Valid until end of 2025
    description: '80% off for your first 2 months',
    isActive: true,
    minimumPlan: null, // Available for all plans
    oneTimeUse: false, // Can be used multiple times
    firstTimeOnly: false // Available for all users
  },
  'NEWYEAR50': {
    id: 'NEWYEAR50',
    name: 'New Year Special - 50% Off Full Year',
    discount: 0.50, // 50% discount
    duration: 12, // months (whole year)
    validUntil: new Date('2025-12-31'), // Valid until end of 2025
    description: '50% off for your entire first year',
    isActive: true,
    minimumPlan: null, // Available for all plans
    oneTimeUse: true, // One-time promotion
    firstTimeOnly: true // First-time buyers only
  }
};

// Validate and apply promo code
export function validatePromoCode(code, userInfo = null) {
  const promoCode = PROMO_CODES[code.toUpperCase()];
  
  if (!promoCode) {
    return { valid: false, error: 'Invalid promo code' };
  }
  
  if (!promoCode.isActive) {
    return { valid: false, error: 'Promo code is no longer active' };
  }
  
  if (new Date() > promoCode.validUntil) {
    return { valid: false, error: 'Promo code has expired' };
  }
  
  // Check if this is a first-time only promo code
  if (promoCode.firstTimeOnly) {
    // In a real implementation, you would check the database for previous purchases
    // For now, we'll simulate this check
    if (userInfo?.hasPreviousPurchases) {
      return { valid: false, error: 'This promo code is only available for first-time customers' };
    }
  }
  
  return { 
    valid: true, 
    promoCode: promoCode,
    discount: promoCode.discount,
    duration: promoCode.duration,
    isFirstTimeOnly: promoCode.firstTimeOnly,
    isOneTimeUse: promoCode.oneTimeUse
  };
}

// Calculate discounted price
export function calculateDiscountedPrice(originalPrice, promoCode) {
  if (!promoCode || !promoCode.valid) {
    return originalPrice;
  }
  
  const discount = promoCode.discount || 0;
  const discountedPrice = originalPrice * (1 - discount);
  
  return Math.round(discountedPrice * 100) / 100; // Round to 2 decimal places
}