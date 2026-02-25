import Inventory from "../models/productModel.js";
import Sales from "../models/salesModel.js";
import Customer from "../models/customerModel.js";

const checkout = async (req, res) => {
    try {

        const { customer_id, items, payment_method, amount_paid = 0 } = req.body;

        // Validate cart
        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
        }

        // Validate payment method
        if (!payment_method) {
            return res.status(400).json({
                message: "Payment method is required"
            });
        }

        let customer = null;

        // If customer is provided
        if (customer_id) {
            customer = await Customer.findById(customer_id);

            if (!customer) {
                return res.status(404).json({
                    message: "Customer not found"
                });
            }
        }

        let subtotal = 0;
        let total_discount = 0;
        const saleItems = [];

        for (const item of items) {

            const product = await Inventory.findById(item.product_id);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            if (product.quantity < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.medicine_name}`
                });
            }

            const discountPercent = item.discount_percent || 0;

            if (discountPercent < 0 || discountPercent > 100) {
                return res.status(400).json({
                    message: "Discount must be between 0 and 100"
                });
            }

            const itemSubtotal = product.mrp * item.quantity;

            const discountAmount = Number(
                ((itemSubtotal * discountPercent) / 100).toFixed(2)
            );

            const itemTotal = Number(
                (itemSubtotal - discountAmount).toFixed(2)
            );

            subtotal += itemSubtotal;
            total_discount += discountAmount;

            saleItems.push({
                product_id: product._id,
                medicine_name: product.medicine_name,
                barcode: product.barcode,
                mrp: product.mrp,
                quantity: item.quantity,
                discount_percent: discountPercent,
                discount_amount: discountAmount,
                total: itemTotal
            });

            // Deduct stock
            product.quantity -= item.quantity;
            await product.save();
        }

        subtotal = Number(subtotal.toFixed(2));
        total_discount = Number(total_discount.toFixed(2));

        const grandTotal = Number(
            (subtotal - total_discount).toFixed(2)
        );

        // Validate amount paid
        if (amount_paid < 0) {
            return res.status(400).json({
                message: "Invalid amount paid"
            });
        }

        if (amount_paid > grandTotal) {
            return res.status(400).json({
                message: "Amount paid cannot exceed total"
            });
        }

        const dueAmount = Number(
            (grandTotal - amount_paid).toFixed(2)
        );

        const invoiceNumber = `INV-${Date.now()}`;

        const sale = await Sales.create({
            invoice_number: invoiceNumber,
            customer: customer ? customer._id : null,
            customer_name: customer ? customer.name : null,
            customer_phone: customer ? customer.phone_no : null,
            items: saleItems,
            subtotal,
            total_discount,
            grand_total: grandTotal,
            amount_paid,
            due_amount: dueAmount,
            payment_method
        });

        // If due exists and customer selected → update credit
        if (customer && dueAmount > 0) {
            customer.credit_balance += dueAmount;
            await customer.save();
        }

        return res.status(200).json({
            message: dueAmount > 0 
                ? "Billing successful. Due recorded."
                : "Billing successful",
            invoice: sale,
            due_amount: dueAmount,
            customer_credit_balance: customer ? customer.credit_balance : null
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

export { checkout };