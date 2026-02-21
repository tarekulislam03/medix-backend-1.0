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

    alert_threshold: {
        type: Number,
        default: 10,
        
    },

    expiry_date: {
        type: Date,
        required: true,
        
    }, 

    supplier_name: {
        type: String,
        required: true,
    },
    barcode: {
        type: String,
        unique: true,
    }
},

{
    timestamps: true
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export default Inventory;