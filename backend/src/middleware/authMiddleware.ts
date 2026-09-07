import { NextFunction, Request, Response } from "express";
import { adminAuth, db } from "../config/firebaseAdmin";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    role: "admin" | "viewer";
  };
}

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    const decodedToken = await adminAuth.verifyIdToken(token);

    const userDoc = await db.collection("users").doc(decodedToken.uid).get();

    if (!userDoc.exists) {
      return res.status(403).json({
        message: "User role not configured",
      });
    }

    const userData = userDoc.data();

    if (userData?.role !== "admin" && userData?.role !== "viewer") {
      return res.status(403).json({
        message: "Invalid user role",
      });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
