import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";

import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../repositories/productRepository";

function isValidStatus(status: unknown) {
  return status === "active" || status === "inactive";
}

export async function getProductsController(req: AuthRequest, res: Response) {
  try {
    const products = await getAllProducts();

    return res.status(200).json(products);
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getProductController(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function createProductController(req: AuthRequest, res: Response) {
  try {
    const { name, category, price, status } = req.body;

    if (
      typeof name !== "string" ||
      typeof category !== "string" ||
      typeof price !== "number" ||
      price < 0 ||
      !isValidStatus(status)
    ) {
      return res.status(400).json({
        message: "Invalid product data",
      });
    }

    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (typeof category !== "string" || category.trim() === "") {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    const product = await createProduct(
      {
        name: name.trim(),
        category: category.trim(),
        price,
        status,
      },
      req.user!.uid,
    );

    return res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function updateProductController(req: AuthRequest, res: Response) {
  try {
    const { name, category, price, status } = req.body;

    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return res.status(400).json({
        message: "Invalid price",
      });
    }

    if (status !== undefined && !isValidStatus(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const updates = {
      ...(name !== undefined && { name: String(name).trim() }),
      ...(category !== undefined && {
        category: String(category).trim(),
      }),
      ...(price !== undefined && { price }),
      ...(status !== undefined && { status }),
    };

    const id = req.params.id;

    if (typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        message: "Name is required",
      });
    }

    if (typeof category !== "string" || category.trim() === "") {
      return res.status(400).json({
        message: "Category is required",
      });
    }

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const product = await updateProduct(id, updates);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("Update product error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function deleteProductController(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id;

    if (typeof id !== "string") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    const deleted = await deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
