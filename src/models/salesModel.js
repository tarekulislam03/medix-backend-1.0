import mongoose from "mongoose";

const SalesSchema = new mongoose.Schema({
    invoice_number: {
        type: String,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: false
    },
    items: [
        {
            product_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Inventory"
            },
            product_name: String,
            barcode: String,
            mrp: Number,
            quantity: Number,
            discount_percent: Number,
            discount_amount: Number,
            total: Number
        }
    ],

    subtotal: Number,
    total_discount: Number,
    grand_total: Number,

    payment_method: {
        type: String,
        enum: ["cash", "upi", "card"]
    },

    created_at: {
        type: Date,
        default: Date.now
    }
});

const Sales = mongoose.model("Sales", SalesSchema);

export default Sales;