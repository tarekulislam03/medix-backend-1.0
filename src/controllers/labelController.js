import Inventory from "../models/productModel.js";
import { generateBarcodeBuffer } from "../services/generateLabel.js";
import PDFDocument from 'pdfkit';
import bwipjs from 'bwip-js';


// Single product barcode image gen
export const getSingleBarcode = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Inventory.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // 58mm width ≈ 164 points
        const doc = new PDFDocument({
            size: [164, 250],  // width, height in points
            margin: 10
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `inline; filename=${product.barcode}.pdf`
        );

        doc.pipe(res);

        // Generate barcode image
        const barcodeBuffer = await bwipjs.toBuffer({
            bcid: 'code128',
            text: product.barcode,
            scale: 2,
            height: 15,
            includetext: true,
            textxalign: 'center',
        });

        // Product Name
        doc.fontSize(10)
           .text(product.medicine_name, {
               align: 'center'
           });

        doc.moveDown(0.5);

        // Barcode
        doc.image(barcodeBuffer, {
            fit: [140, 80],
            align: 'center'
        });

        doc.moveDown(0.5);

        // MRP
        doc.fontSize(10)
           .text(`MRP: ₹${product.mrp}`, {
               align: 'center'
           });

        doc.end();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Bulk barcode label pdf gen
export const generateBulkBarcodes = async (req, res) => {
    try {
        const { productIds } = req.body;

        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({
                message: "Product IDs required"
            });
        }

        const products = await Inventory.find({
            _id: { $in: productIds }
        });

        // 58mm thermal width
        const doc = new PDFDocument({
            size: [164, 1000],   // width fixed, height long
            margin: 10
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'inline; filename=thermal-barcodes.pdf'
        );

        doc.pipe(res);

        for (const product of products) {

            // Product Name
            doc.fontSize(10)
               .text(product.medicine_name, {
                   align: 'center'
               });

            doc.moveDown(0.3);

            // Generate barcode
            const barcodeBuffer = await bwipjs.toBuffer({
                bcid: 'code128',
                text: product.barcode,
                scale: 2,
                height: 15,
                includetext: true,
                textxalign: 'center',
            });

            doc.image(barcodeBuffer, {
                fit: [140, 80],
                align: 'center'
            });

            doc.moveDown(0.3);

            doc.fontSize(10)
               .text(`MRP: ₹${product.mrp}`, {
                   align: 'center'
               });

            doc.moveDown(1);

            // Divider line between labels
            doc.moveTo(10, doc.y)
               .lineTo(154, doc.y)
               .stroke();

            doc.moveDown(1);
        }

        doc.end();

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};