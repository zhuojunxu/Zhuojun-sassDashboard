import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://zhuojun-sass-dashboard.vercel.app",
    ],
  }),
);

app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/products", productRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
