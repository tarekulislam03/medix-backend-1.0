import { Router } from "express";
import { createCustomer, deleteCustomer, getAllCustomers, getCustomerById, getCustomerLastPurchase,  searchCustomer, updateCustomer } from "../controllers/customerController.js";


const customerRouter = Router();

customerRouter.post("/create", createCustomer);
customerRouter.get("/get", getAllCustomers);
customerRouter.get("/get/:id", getCustomerById);
customerRouter.put("/update/:id", updateCustomer);
customerRouter.delete("/delete/:id", deleteCustomer);
customerRouter.get("/search", searchCustomer);
customerRouter.get("/lastpurchase/:id", getCustomerLastPurchase);

export default customerRouter;