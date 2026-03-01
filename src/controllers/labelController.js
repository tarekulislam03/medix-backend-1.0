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

        const barcodeValue = product.barcode;

        const barcodeBuffer = await generateBarcodeBuffer(barcodeValue);

        res.setHeader('Content-Type', 'image/png');
        res.send(barcodeBuffer);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Bulk barcode label pdf gen
export const generateBulkBarcodes = async (req, res) => {
    try {
        const { productIds } = req.body;  

        if (!productIds || !Array.isArray(productIds)) {
            return res.status(400).json({ message: "Product IDs required" });
        }

        const products = await Inventory.find({
            _id: { $in: productIds }
        });

        const doc = new PDFDocument({
            size: 'A4',
            margin: 20
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            'inline; filename=barcodes.pdf'
        );

        doc.pipe(res);

        let x = 40;
        let y = 40;

        const labelWidth = 180;
        const labelHeight = 100;

        for (const product of products) {

            const barcodeBuffer = await bwipjs.toBuffer({
                bcid: 'code128',
                text: product.barcode,
                scale: 2,
                height: 10,
                includetext: true,
                textxalign: 'center',
            });

            doc.image(barcodeBuffer, x, y, { width: 150 });
            doc.text(product.medicine_name, x, y + 60, {
                width: 150,
                align: 'center'
            });

            x += labelWidth;

            if (x > 400) {
                x = 40;
                y += labelHeight;
            }

            if (y > 750) {
                doc.addPage();
                x = 40;
                y = 40;
            }
        }

        doc.end();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};