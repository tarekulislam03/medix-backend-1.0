import mongoose, { Schema } from "mongoose";

const customerSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    phone_no: {
        type: String,
        required: true
    }
})

const Customer = mongoose.model("Customer", customerSchema);

export default Customer;