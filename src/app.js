import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());

import productRouter from "./routes/productRoutes.js"
import billingRouter from "./routes/billingRoutes.js";

app.use("/api/v1/product", productRouter)
app.use("/api/v1/billing", billingRouter)


export default app;