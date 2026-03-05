import bwipjs from "bwip-js";
import Inventory from "../models/productModel.js";
import sharp from "sharp";
import { callVisionModel } from "../services/llmService.js";
import { safeParseJSON } from "../services/jsonParser.js";

// Create product
const createProduct = async (req, res) => {
    try {
        const {
            medicine_name,
            mrp,
            quantity,
            supplier_name,
            expiry_date,
            alert_threshold,
            tablets_per_strip
        } = req.body;

        if (!medicine_name || !mrp || !quantity) {
            return res.status(400).json({
                message: "medicine_name, mrp and quantity are required"
            });
        }

        const cleanNumber = (val) =>
            Number(String(val || 0).replace(/[^\d.]/g, "")) || 0;

        const normalizedName = medicine_name.trim().toUpperCase();

        const barcodeString =
            `${normalizedName.replace(/\s/g, '')}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const product = await Inventory.findOneAndUpdate(
            {
                medicine_name: {
                    $regex: new RegExp(`^${normalizedName}$`, "i")
                }
            },
            {
                $inc: { quantity: cleanNumber(quantity) },
                $set: {
                    mrp: cleanNumber(mrp),
                    supplier_name: supplier_name || null,
                    expiry_date: expiry_date || null,
                    alert_threshold: alert_threshold || null,
                    tablets_per_strip: tablets_per_strip ? cleanNumber(tablets_per_strip) : null
                },
                $setOnInsert: {
                    medicine_name: normalizedName,
                    barcode: barcodeString
                }
            },
            {
                new: true,
                upsert: true
            }
        );

        return res.status(201).json({
            message: "Product saved successfully",
            data: product
        });

    } catch (error) {
        console.error("Create Product Error:", error);

        return res.status(500).json({
            message: error.message
        });
    }
};
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

// SearcH Products 

const searchProduct = async (req, res) => {
    try {

        const keyword = req.query.keyword || "";

        // Validation
        if (!keyword) {
            res.status(400).json({
                message: "Search keywords are required"

            })
        }

        const product = await Inventory.find({
            $or: [
                { medicine_name: { $regex: keyword, $options: "i" } },
                { barcode: keyword }
            ]
        });

        if (!product || product.length === 0) {
            return res.status(400).json({
                message: "No products found for this keyword"
            });
        }

        res.status(200).json({
            count: `${product.length} products found for this keyword`,
            data: product,
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Internal Server Error",
            data: error
        });
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


// Get loose medicine price per tablet
const getLooseMedicinePrice = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.query; // optional: number of tablets requested

        const product = await Inventory.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        if (!product.tablets_per_strip || product.tablets_per_strip <= 0) {
            return res.status(400).json({
                success: false,
                message: "This product is not configured for loose sale. Please set tablets_per_strip."
            });
        }

        const pricePerTablet = Number((product.mrp / product.tablets_per_strip).toFixed(2));

        const requestedQty = quantity ? Number(quantity) : null;
        const totalPrice = requestedQty
            ? Number((pricePerTablet * requestedQty).toFixed(2))
            : null;

        return res.status(200).json({
            success: true,
            medicine_name: product.medicine_name,
            mrp_per_strip: product.mrp,
            tablets_per_strip: product.tablets_per_strip,
            price_per_tablet: pricePerTablet,
            ...(requestedQty && {
                requested_tablets: requestedQty,
                total_price: totalPrice
            })
        });

    } catch (error) {
        console.error("Loose Medicine Price Error:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// auto product import from bill image using AI
const autoImportProducts = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image uploaded"
            });
        }

        //Preprocess Image (rotate + resize)
        const processedBuffer = await sharp(req.file.buffer)
            .rotate()               // auto-fix orientation
            .resize({ width: 1200 }) // optimize for OCR
            .toBuffer();

        //Convert to base64
        const base64Image = processedBuffer.toString("base64");

        //Call AI
        const aiRaw = await callVisionModel(base64Image);

        const parsed = safeParseJSON(aiRaw);

        if (!parsed.items || !Array.isArray(parsed.items)) {
            throw new Error("Invalid AI response format");
        }

        return res.json({
            success: true,
            imported_products: parsed.items.length,
            items: parsed.items
        });

    } catch (error) {
        console.error("FULL ERROR:", error);
        console.error("ERROR RESPONSE:", error.response?.data);

        return res.status(500).json({
            success: false,
            message: "Auto import failed",
            error: error.response?.data || error.message
        });
    }
}


const autoImportConfirm = async (req, res) => {
    try {
        const { items } = req.body;

        if (!items || !Array.isArray(items)) {
            return res.status(400).json({
                success: false,
                message: "Invalid items format"
            });
        }

        let updatedCount = 0;
        let createdCount = 0;

        const cleanNumber = (val) =>
            Number(String(val || 0).replace(/[^\d.]/g, "")) || 0;

        console.log("Items received:", items);
        for (const item of items) {

            const medicineNameRaw = item.medicine_name || item.product_name;
            if (!medicineNameRaw) continue;

            const medicineName = medicineNameRaw.trim();

            const barcodeString =
                `${medicineName.replace(/\s/g, '').toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const result = await Inventory.findOneAndUpdate(
                {
                    medicine_name: {
                        $regex: new RegExp(`^${medicineName}$`, "i")
                    }
                },
                {
                    $inc: { quantity: cleanNumber(item.quantity) },
                    $set: {
                        mrp: cleanNumber(item.mrp),
                        expiry_date: item.expiry_date || null
                    },
                    $setOnInsert: {
                        barcode: barcodeString,
                        supplier_name: item.supplier_name || null,
                        alert_threshold: item.alert_threshold || null
                    }
                },
                {
                    new: true,
                    upsert: true,
                    rawResult: true
                }
            );

            if (result.lastErrorObject.upserted) {
                createdCount++;
            } else {
                updatedCount++;
            }
        }

        return res.json({
            success: true,
            updated_products: updatedCount,
            new_products: createdCount
        });

    } catch (error) {
        console.error("Confirm Import Error:", error);

        return res.status(500).json({
            success: false,
            message: "Confirm import failed",
            error: error.message
        });
    }
};
export { createProduct, getProducts, getProductById, updateProduct, deleteProduct, searchProduct, lowStock, soonToExpiry, autoImportProducts, autoImportConfirm, getLooseMedicinePrice };