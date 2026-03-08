import mongoose, { Schema } from "mongoose";

const inventorySchema = new Schema({
    medicine_name: {
        type: String,
        required: true,
        unique: true,
    },

    mrp: {
        type: Number,
        required: true,
    },

    quantity: {
        type: Number,
        required: true,
    },

    cost_price: {
        type: Number
    },


    alert_threshold: {
        type: Number,
        default: 10,

    },

    expiry_date: {
        type: Date

    },

    supplier_name: {
        type: String
    },
    barcode: {
        type: String,
        unique: true,
        sparse: true
    },

    short_barcode: {
        type: String,
        unique: true,
        sparse: true
    },

    tablets_per_strip: {
        type: Number,
        default: null
    }
},

    {
        timestamps: true
    });

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;