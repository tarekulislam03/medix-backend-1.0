import Customer from "../models/customerModel.js";
import Sales from "../models/salesModel.js";
import mongoose from "mongoose";

// create customer
const createCustomer = async (req, res) => {
    try {
        const { name, phone_no } = req.body;

        // Validation
        if (!name || !phone_no) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // Optional: prevent duplicate phone numbers
        const existing = await Customer.findOne({ phone_no });
        if (existing) {
            return res.status(400).json({
                message: "Customer with this phone number already exists"
            });
        }

        const customer = await Customer.create({
            name,
            phone_no
        });

        return res.status(201).json({
            message: "Customer created successfully",
            data: customer
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


// get all customer
const getAllCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });

        return res.status(200).json({
            data: customers
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


// get customer by id
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        return res.status(200).json({
            data: customer
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


// update customer
const updateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone_no } = req.body;

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        if (name) customer.name = name;
        if (phone_no) customer.phone_no = phone_no;

        await customer.save();

        return res.status(200).json({
            message: "Customer updated successfully",
            data: customer
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


// delete customer
const deleteCustomer = async (req, res) => {
    try {
        const { id } = req.params;

        const customer = await Customer.findById(id);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        await Customer.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Customer deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


// search customer by name
const searchCustomer = async (req, res) => {
    try {
        const q = req.query.q || "";

        if (!q) {
            return res.status(400).json({
                message: "Search query is required"
            });
        }

        const customers = await Customer.find({
            $or: [
                { name: { $regex: q, $options: "i" } },
                { phone_no: { $regex: q, $options: "i" } }
            ]
        }).limit(5);

        return res.status(200).json({
            data: customers
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

const getCustomerLastPurchase = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("Incoming customer id:", id);

    const allSales = await Sales.find({ customer: id });
    console.log("Matching sales count:", allSales.length);

    const lastSale = await Sales.findOne({ customer: id })
      .sort({ created_at: -1 });

    console.log("Last sale found:", lastSale);

    if (!lastSale) {
      return res.status(200).json({ data: null });
    }

    return res.status(200).json({
      data: lastSale
    });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: error.message
    });
  }
};

export { createCustomer, getAllCustomers, getCustomerById, updateCustomer, deleteCustomer, searchCustomer, getCustomerLastPurchase }