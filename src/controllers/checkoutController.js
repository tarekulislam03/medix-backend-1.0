import Inventory from "../models/productModel.js";
import Sales from "../models/salesModel.js";

const checkout = async (req, res) => {
    try {
        const { items, payment_method } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" });
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

            // Validate discount percent
            const discountPercent = item.discount_percent || 0;

            if (discountPercent < 0 || discountPercent > 100) {
                return res.status(400).json({
                    message: "Discount must be between 0 and 100"
                });
            }

            const itemSubtotal = product.mrp * item.quantity;
            const discountAmount = (itemSubtotal * discountPercent) / 100;
            const itemTotal = itemSubtotal - discountAmount;

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

        const grandTotal = subtotal - total_discount;

        const invoiceNumber = `INV-${Date.now()}`;

        const sale = await Sales.create({
            invoice_number: invoiceNumber,
            items: saleItems,
            subtotal,
            total_discount,
            grand_total: grandTotal,
            payment_method
        });

        return res.status(200).json({
            message: "Billing successful",
            invoice: sale
        });

    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export { checkout };