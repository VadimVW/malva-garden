export type ProductStatus = "ACTIVE" | "HIDDEN";
export type OrderStatus =
  | "NEW"
  | "PROCESSING"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export type Category = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ProductImage = {
  id: string;
  productId: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  isMain: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  careDescription: string | null;
  price: string | { toString(): string };
  stockQuantity: number;
  status: ProductStatus;
  categoryId: string | null;
  category: { id: string; name: string; slug: string } | null;
  seoTitle: string | null;
  seoDescription: string | null;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
};

export type OrderListItem = {
  id: string;
  orderNumber: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: string;
  customerName: string;
  customerPhone: string;
  createdAt: string;
};

export type OrdersPage = {
  items: OrderListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type OrderDetail = OrderListItem & {
  customerEmail: string | null;
  deliveryMethod: string | null;
  deliveryCity: string | null;
  deliveryAddress: string | null;
  paymentMethod: string | null;
  comment: string | null;
  managerComment: string | null;
  updatedAt: string;
  items: {
    id: string;
    productId: string | null;
    productNameSnapshot: string;
    priceSnapshot: string;
    quantity: number;
    lineTotal: string;
  }[];
};

export type ContentPage = {
  id: string;
  title: string;
  slug: string;
  content: string;
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SiteSetting = {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginResponse = { access_token: string };
