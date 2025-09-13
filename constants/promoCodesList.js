// Available promo codes for display to users
export const AVAILABLE_PROMO_CODES = [
  {
    code: 'LAUNCH80',
    title: 'Launch Special',
    description: '80% off for first 2 months',
    discount: '80%',
    duration: '2 months',
    highlight: true,
    type: 'limited_time'
  },
  {
    code: 'NEWYEAR50',
    title: 'First Year Special',
    description: '50% off entire first year',
    discount: '50%',
    duration: '12 months',
    highlight: true,
    type: 'first_time_only',
    restriction: 'New customers only'
  }
];

// Get user-friendly promo code information
export function getPromoCodeInfo(code) {
  return AVAILABLE_PROMO_CODES.find(promo => promo.code.toUpperCase() === code.toUpperCase());
}