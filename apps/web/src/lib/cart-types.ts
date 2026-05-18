export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  imageUrl?: string | null;
  stockQuantity?: number;
};

export type CartResponse = {
  token: string;
  subtotal: string;
  items: CartItem[];
};
