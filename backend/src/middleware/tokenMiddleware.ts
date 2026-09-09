import { NextFunction, Request, Response } from "express";
import { adminAuth } from "../config/firebaseAdmin";

export interface TokenRequest extends Request {
  firebaseUser?: {
    uid: string;
    email?: string;
  };
}

export async function verifyToken(
  req: TokenRequest,
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

    const token = authHeader.substring(7);

    const decodedToken = await adminAuth.verifyIdToken(token);

    req.firebaseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
}
