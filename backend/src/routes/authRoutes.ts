import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

router.get("/me", authenticate, (req: AuthRequest, res) => {
  return res.status(200).json({
    uid: req.user?.uid,
    email: req.user?.email,
    role: req.user?.role,
  });
});

export default router;
