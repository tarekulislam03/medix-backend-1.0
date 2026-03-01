import { Router } from "express";
import { generateBulkBarcodes, getSingleBarcode } from "../controllers/labelController.js";

const labelRouter = Router();

labelRouter.get('/single/:id', getSingleBarcode);
labelRouter.post('/bulk', generateBulkBarcodes);

export default labelRouter;