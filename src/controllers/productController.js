import Inventory from "../models/productModel.js";

// Create product
const createProduct = async (req, res) => {
    try {

        // If body is an array → bulk upload
        if (Array.isArray(req.body)) {
            const products = await Inventory.insertMany(req.body);

            return res.status(201).json({
                message: "Products added successfully",
                
                data: products,
            });
        }

        const { product_name, mrp, quantity, alert_threshold, expiry_date } = req.body

        // Validation
        if (!product_name || !mrp || !quantity || !expiry_date) {
            return res.status(400).json({
                message: "All fields are required",

            })
        }


        const product = await Inventory.create({
            product_name,
            mrp,
            quantity,
            expiry_date,
            alert_threshold
        });

        return res.status(200).json({
            message: "Product Added Succesfully",
            data: { product_name: product.product_name, mrp: product.mrp, quantity: product.quantity, expiry_date: product.expiry_date },
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })

    }
}

// Get all Products
const getProducts = async (req, res) => {
    try {

        const product = await Inventory.find();

        if (!product) {
            return res.status(400).json({
                message: "No  products found"
            })
        }

        res.status(200).json({
            message: "Products fetched successfully!",
            count: `Total Products - ${product.length}`,
            data: product
        })


    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

// get a product by id
const getProductById = async (req, res) => {
    try {

        const product = await Inventory.findById(req.params.id);

        if (!product) {
            return res.status(400).json({
                message: "No  products found"
            })
        }

        res.status(200).json({
            message: "Product fetched successfully!",
            data: product
        })

    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

// Update product by id
const updateProduct = async (req, res) => {
    try {

        const update = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!update) {
            return res.status(400).json({
                message: "No products found"
            })
        }

        res.status(200).json({
            message: "Product updated successfully!",
            data: update
        })


    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

// Delete Product
const deleteProduct = async (req, res) => {
    try {

        const deleteitems = await Inventory.findByIdAndDelete(req.params.id);

        if (!deleteitems) {
            return res.status(400).json({
                message: "No products found"
            })
        }

        res.status(200).json({
            message: "Product delted successfully!",
        })


    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error",
            data: error
        })
    }
}

// SearCH Products 

const searchProduct  = async (req, res)=>{
    try {
        
        const keyword = req.query.keyword || "";

        // Validation
        if(!keyword){
            res.status(400).json({
                message: "Search keywords are required"
            
            })
        }

        const product = await Inventory.find({
            product_name:{
                $regex: keyword,
                $options: "i"
            
            }
        })

        if(!product){
            return res.status(400).json({
                message: "No products found for this keyword"
            })
        }

        res.status(200).json({
            count: `${product.length} prdoucts found for this keyword`,
            data: product,
            
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error",
            data: error
        })
    }
}

const lowStock = async (req, res) => {
    try {

        // find low stock products ( quantity <= alert_threshold )
        const low = await Inventory.find({
            $expr: { $lte: ["$quantity", "$alert_threshold"] }
        })

        if (low) {
            return res.status(200).json({
                count: `Total Low Stock Products - ${low.length}`,
                data: low
            })
        }
    } catch (error) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
}

// Soon to expiry products
const soonToExpiry = async (req, res) => {
    try {

        const today = new Date();
        const next90Days = new Date();
        next90Days.setDate(today.getDate() + 90);


        const expiry = await Inventory.find({
            expiry_date: { $lte: next90Days }
        })

        if (expiry) {
            res.status(200).json({
                count: `Total Soon to Expiry Products - ${expiry.length}`,
                data: expiry
            })
        }

    } catch (error) {

    }
}


export { createProduct, getProducts, getProductById, updateProduct, deleteProduct, searchProduct, lowStock, soonToExpiry  };