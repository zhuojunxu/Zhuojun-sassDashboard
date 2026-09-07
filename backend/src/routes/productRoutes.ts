import { Router } from "express";
import { authenticate } from "../middleware/authMiddleware";
import { requireRole } from "../middleware/roleMiddleware";

import {
  createProductController,
  deleteProductController,
  getProductController,
  getProductsController,
  updateProductController,
} from "../controllers/productController";

const router = Router();

router.get("/", authenticate, getProductsController);

router.get("/:id", authenticate, getProductController);

router.post("/", authenticate, requireRole("admin"), createProductController);

router.patch(
  "/:id",
  authenticate,
  requireRole("admin"),
  updateProductController,
);

router.delete(
  "/:id",
  authenticate,
  requireRole("admin"),
  deleteProductController,
);

export default router;
