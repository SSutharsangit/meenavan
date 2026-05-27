const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch categories");
    const json = await res.json();
    const data = json.result?.data || json.result || [];
    return data.map((cat: any) => ({
      id: cat.id,
      name: cat.name_en,
      nameTA: cat.name_ta || cat.name_en,
      icon: cat.icon || "🐟",
      count: 0, 
      color: "from-cyan-500 to-blue-500", 
      desc: cat.description || "Fresh seafood"
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchProducts(params: Record<string, string> = {}) {
  try {
    const searchParams = new URLSearchParams(params);
    const res = await fetch(`${API_BASE_URL}/products?${searchParams.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch products");
    const json = await res.json();
    const data = json.result?.data || json.result || [];
    return data.map((prod: any) => ({
      id: prod.id,
      name: prod.name_en,
      nameTA: prod.name_ta || prod.name_en,
      price: parseFloat(prod.discounted_price) || parseFloat(prod.price_per_kg) || 0,
      oldPrice: parseFloat(prod.discount_percentage) > 0 ? parseFloat(prod.price_per_kg) : null,
      unit: "1 kg", 
      rating: parseFloat(prod.rating_average) || 4.5,
      reviews: prod.rating_count || 0,
      image: prod.primary_image || "/images/seer-fish.png", 
      badge: prod.is_bestseller ? "Bestseller" : (prod.freshness_tag || null),
      inStock: prod.is_available && parseFloat(prod.stock_quantity) > 0,
      categoryId: prod.category_id,
      description: prod.description_en || "Premium quality seafood.",
      weight: "1 kg",
      origin: "Local",
      freshness: prod.freshness_tag || "Fresh"
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchProductById(id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch product");
    const json = await res.json();
    const prod = json.result;
    return {
      id: prod.id,
      name: prod.name_en,
      nameTA: prod.name_ta || prod.name_en,
      price: parseFloat(prod.discounted_price) || parseFloat(prod.price_per_kg) || 0,
      oldPrice: parseFloat(prod.discount_percentage) > 0 ? parseFloat(prod.price_per_kg) : null,
      unit: "1 kg",
      rating: parseFloat(prod.rating_average) || 4.5,
      reviews: prod.rating_count || 0,
      image: prod.primary_image || "/images/seer-fish.png",
      badge: prod.is_bestseller ? "Bestseller" : (prod.freshness_tag || null),
      inStock: prod.is_available && parseFloat(prod.stock_quantity) > 0,
      categoryId: prod.category_id,
      description: prod.description_en || "Premium quality seafood.",
      weight: "1 kg",
      origin: "Local",
      freshness: prod.freshness_tag || "Fresh"
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function fetchOffers() {
  try {
    const res = await fetch(`${API_BASE_URL}/offers`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch offers");
    const json = await res.json();
    const data = json.result?.data || json.result || [];
    return data.map((offer: any) => ({
      id: offer.id,
      title: offer.title_en,
      subtitle: offer.description_en || "",
      code: offer.code,
      validUntil: offer.end_date ? new Date(offer.end_date).toLocaleDateString() : "Limited time",
      gradient: "from-orange-500 to-red-500",
      icon: "🎉"
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchDeliveryAreas() {
  try {
    const res = await fetch(`${API_BASE_URL}/delivery-areas`, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error("Failed to fetch delivery areas");
    const json = await res.json();
    const data = json.result?.data || json.result || [];
    return data.map((area: any) => ({
      id: area.id,
      name: area.name_en,
      nameTA: area.name_ta || area.name_en,
      timeMin: area.delivery_time_min || 20,
      timeMax: area.delivery_time_max || 40,
      charge: area.delivery_charges?.length > 0 ? parseFloat(area.delivery_charges[0].charge_amount) : 100,
      freeAbove: area.delivery_charges?.length > 0 ? parseFloat(area.delivery_charges[0].is_free_above_amount) : 2000
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
