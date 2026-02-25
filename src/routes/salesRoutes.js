import { Router } from "express";
import { monthlySales, todaySales } from "../controllers/salesController.js";

const salesRouter = Router();

salesRouter.get("/today", todaySales);
salesRouter.get("/monthly", monthlySales);

export default salesRouter;