import express from "express";
import cors from "cors";
const app = express();
app.use(cors());
app.use(express.json());

import productRouter from "./routes/productRoutes.js"
import billingRouter from "./routes/billingRoutes.js";
import salesRouter from "./routes/salesRoutes.js";
import customerRouter from "./routes/customerRoutes.js";
import labelRouter from "./routes/labelRoutes.js";

app.use("/api/v1/product", productRouter)
app.use("/api/v1/billing", billingRouter)
app.use("/api/v1/sales", salesRouter)
app.use("/api/v1/customer", customerRouter)
app.use('/api/v1/barcode', labelRouter);

export default app;