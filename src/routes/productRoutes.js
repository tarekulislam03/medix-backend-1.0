import { Router } from "express";
import { createProduct, deleteProduct, getProductById, getProducts, searchProduct, updateProduct, soonToExpiry, lowStock} from "../controllers/productController.js"

const productRouter = Router();

productRouter.post("/create", createProduct);
productRouter.get("/get", getProducts);
productRouter.get("/get/:id", getProductById);
productRouter.put("/update/:id", updateProduct);
productRouter.delete("/delete/:id", deleteProduct);
productRouter.get("/lowstock", lowStock);
productRouter.get("/soontoexpiry", soonToExpiry );
productRouter.get("/search", searchProduct );


export default productRouter;