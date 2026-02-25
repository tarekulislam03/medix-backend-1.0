import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    phone_no: {
        type: String,
        required: true
    },
    credit_balance: {
        type: Number,
        default: 0
    }
})

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;