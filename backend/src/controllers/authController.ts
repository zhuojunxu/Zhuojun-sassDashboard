import { Response } from "express";
import { FieldValue } from "firebase-admin/firestore";
import { db } from "../config/firebaseAdmin";
import { TokenRequest } from "../middleware/tokenMiddleware";

export async function registerUserController(req: TokenRequest, res: Response) {
  try {
    const uid = req.firebaseUser?.uid;
    const email = req.firebaseUser?.email;

    if (!uid) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    const userRef = db.collection("users").doc(uid);
    const existingUser = await userRef.get();

    if (existingUser.exists) {
      return res.status(409).json({
        message: "User profile already exists",
      });
    }

    await userRef.set({
      email: email ?? null,
      role: "viewer",
      createdAt: FieldValue.serverTimestamp(),
    });

    return res.status(201).json({
      uid,
      email,
      role: "viewer",
    });
  } catch (error) {
    console.error("Register user error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
