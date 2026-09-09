import { Router } from "express";
import { authenticate, AuthRequest } from "../middleware/authMiddleware";
import { verifyToken } from "../middleware/tokenMiddleware";
import { registerUserController } from "../controllers/authController";

const router = Router();

/*For Sign up*/
router.post("/register", verifyToken, registerUserController);

/*For Sign in*/
router.get("/me", authenticate, (req: AuthRequest, res) => {
  return res.status(200).json({
    uid: req.user?.uid,
    email: req.user?.email,
    role: req.user?.role,
  });
});

export default router;
