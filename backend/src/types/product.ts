export type ProductStatus = "active" | "inactive";

export interface ProductInput {
  name: string;
  category: string;
  price: number;
  status: ProductStatus;
}

export interface Product extends ProductInput {
  id: string;
  createdBy: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
