import mongoose from "mongoose";

const CreditTransactionSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Customer",
    required: true
  },

  sale: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sales",
    required: false
  },

  type: {
    type: String,
    enum: ["credit_added", "credit_paid"],
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model("CreditTransaction", CreditTransactionSchema);