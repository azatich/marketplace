export const calculateDiscount = (
  price: number,
  discountedPrice: number | null | undefined
): number => {
  if (!price || price <= 0) return 0;
  if (!discountedPrice || discountedPrice <= 0) return 0;
  if (discountedPrice >= price) return 0;

  const discount = ((price - discountedPrice) / price) * 100;
  
  return Math.round(discount);
};