export function mapApiProduct(product) {
  if (!product) return null;

  const variants = (product.variants ?? []).map((variant) => {
    const discount = variant.discount;
    const rawPrice = Number(variant.price ?? 0);
    let effectivePrice = rawPrice;
    if (discount?.type === "percent" || discount?.type === "percentage") {
      effectivePrice = Math.max(0, Math.round(rawPrice * (1 - Number(discount.value) / 100)));
    } else if (discount?.type === "fixed") {
      effectivePrice = Math.max(0, rawPrice - Number(discount.value));
    }

    return {
      ...variant,
      label: variant.name ?? variant.label ?? "",
      price: effectivePrice,
      original_price: rawPrice,
      stock: Number(variant.stock ?? 0),
    };
  });

  const selected = variants.find((variant) => variant.is_default) ?? variants[0];

  return {
    ...product,
    image: product.image_url ?? product.image ?? "",
    category: product.category_id ?? product.category?.id ?? product.category,
    categoryName: product.category?.name ?? "",
    variants,
    unit: selected?.label ?? "",
    price: selected?.price ?? 0,
    original_price: selected?.original_price ?? selected?.price ?? 0,
    stock: selected?.stock ?? 0,
    hasDiscount: variants.some((variant) => variant.original_price > variant.price),
  };
}
