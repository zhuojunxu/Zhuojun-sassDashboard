import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebaseAdmin";
import { ProductInput } from "../types/product";

const productsCollection = db.collection("products");

export async function getAllProducts() {
  const snapshot = await productsCollection.orderBy("createdAt", "desc").get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function getProductById(id: string) {
  const doc = await productsCollection.doc(id).get();

  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  };
}

export async function createProduct(input: ProductInput, createdBy: string) {
  const docRef = productsCollection.doc();

  const product = {
    ...input,
    createdBy,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await docRef.set(product);

  return {
    id: docRef.id,
    ...product,
  };
}

export async function updateProduct(id: string, input: Partial<ProductInput>) {
  const docRef = productsCollection.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return null;
  }

  await docRef.update({
    ...input,
    updatedAt: FieldValue.serverTimestamp(),
  });

  const updatedDoc = await docRef.get();

  return {
    id: updatedDoc.id,
    ...updatedDoc.data(),
  };
}

export async function deleteProduct(id: string) {
  const docRef = productsCollection.doc(id);
  const doc = await docRef.get();

  if (!doc.exists) {
    return false;
  }

  await docRef.delete();

  return true;
}
