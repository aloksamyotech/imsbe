import OrderSchemaModel from "../models/orders.js";
import { messages, tableNames } from "../common/constant.js";
import CustomerSchemaModel from "../models/customer.js";
import ProductSchemaModel from "../models/products.js";
import mongoose from "mongoose";
import sendInvoiceEmail from "../common/email.js";
import PDFDocument from "pdfkit-table";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateInvoicePDF = async (orderData) => {
  const doc = new PDFDocument({ margin: 30, size: "A4" });

  const filePath = path.join(
    __dirname,
    "../uploads/invoices",
    `invoice-${orderData._id}.pdf`
  );

  doc.pipe(fs.createWriteStream(filePath));

  doc
    .fontSize(16)
    .font("Times-BoldItalic")
    .text("Invoice", { align: "center" });
  doc.moveDown(1);

  doc.fontSize(10).font("Times-Bold");
  doc.text(`Invoice No: ${orderData.invoice_no}`, { align: "right" });
  const formattedDate = moment(orderData.date).format("MMMM Do YYYY");
  doc.text(`Date: ${formattedDate}`, { align: "right" });
  doc.moveDown(0.2);

  doc.fontSize(10).font("Times-BoldItalic");
  doc.text(`Bill To:  ${orderData.customerName}`, { align: "left" });
  doc.moveDown(0.5);

  doc.fontSize(10).font("Times-Roman");
  doc.text(`Email: ${orderData.customerEmail}`, { align: "left" });
  doc.moveDown(0.5);
  doc.text(`Phone: ${orderData.customerPhone}`, { align: "left" });
  doc.moveDown(0.5);
  doc.text(`Address: ${orderData.customerAddress}`, { align: "left" });
  doc.moveDown(1);

  const tableData = orderData.products.map((product) => ({
    "Product Name": product.productName,
    Quantity: product.quantity,
    Price: product.price.toFixed(2),
    Subtotal: (product.price * product.quantity).toFixed(2),
  }));

  const tableHeaders = [
    { label: "Product Name", property: "Product Name", width: 150 },
    { label: "Quantity", property: "Quantity", width: 100 },
    { label: "Price", property: "Price", width: 100 },
    { label: "Subtotal", property: "Subtotal", width: 150 },
  ];

  await doc.table(
    {
      title: "",
      headers: tableHeaders,
      datas: tableData,
    },
    {
      margin: 20,
      padding: 5,
      width: 500,
    }
  );

  doc.moveDown(1);

  const leftPadding = 310;

  doc.fontSize(10).font("Times-Bold");

  doc.text(`Subtotal: $${orderData.subtotal.toFixed(2)}`, leftPadding);
  doc.moveDown(0.5);

  doc.text(`Tax: $${orderData.tax.toFixed(2)}`, leftPadding);
  doc.moveDown(0.5);

  doc.text(`Total: $${orderData.total.toFixed(2)}`, leftPadding);

  doc.moveDown(4);
  doc.fontSize(10).font("Times-Roman");
  doc.text("Thank you for your order", { align: "left" });

  doc.end();

  return filePath;
};

export const save = async (req) => {
  const updateProductQuantity = async (productId, quantity) => {
    const product = await ProductSchemaModel.findById(productId);
    if (!product) {
      throw new Error(messages.data_not_found);
    }
    if (product.quantity < quantity) {
      throw new Error(messages.not_available);
    }
    product.quantity -= Number(quantity);
    await product.save();
  };

  try {
    const { date, products, order_status, total, subtotal, tax, customerId } =
      req.body;

    const customer = await CustomerSchemaModel.findById(customerId);
    if (!customer) {
      throw new Error(messages.data_not_found);
    }

    const productOrders = [];
    for (const product of products) {
      const dbProduct = await ProductSchemaModel.findById(product.productId);
      if (!dbProduct) {
        throw new Error(`${messages.data_not_found} ${product.productId}`);
      }

      productOrders.push({
        productId: dbProduct._id,
        productName: dbProduct.productnm,
        categoryName: dbProduct.categoryName,
        quantity: product.quantity,
        price: dbProduct.buyingPrice,
      });
      await updateProductQuantity(product.productId, product.quantity);
    }

    const orderModel = new OrderSchemaModel({
      date: new Date(date),
      products: productOrders,
      order_status: order_status || "Pending",
      total,
      subtotal,
      tax,
      customerId: customerId,
      customerName: customer.customernm,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      customerAddress: customer.address,
    });

    const savedOrder = await orderModel.save();

    const invoicePath = await generateInvoicePDF(savedOrder);

    await sendInvoiceEmail(savedOrder.customerEmail, invoicePath);

    return savedOrder;
  } catch (error) {
    throw new Error(messages.data_add_error + error.message);
  }
};

export const fetch = async (req) => {
  try {
    const condition_obj = { ...req.query };
    const pipeline = [
      { $match: condition_obj },
      {
        $lookup: {
          from: tableNames.customer,
          localField: "customerId",
          foreignField: "_id",
          as: "customerData",
        },
      },
      {
        $unwind: {
          path: "$customerData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          invoice_no: 1,
          order_status: 1,
          subtotal: 1,
          tax: 1,
          total: 1,
          customerId: 1,
          customerName: 1,
          customerEmail: 1,
          customerPhone: 1,
          customerAddress: 1,
          products: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                productId: "$$product.productId",
                productName: "$$product.productName",
                categoryName: "$$product.categoryName",
                quantity: "$$product.quantity",
                price: "$$product.price",
              },
            },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    return await OrderSchemaModel.aggregate(pipeline);
  } catch (error) {
    throw new Error(messages.fetching_failed + error.message);
  }
};

export const fetchById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error(messages.invalid_format);
    }

    const condition_obj = { _id: new mongoose.Types.ObjectId(id) };
    const pipeline = [
      { $match: condition_obj },
      {
        $lookup: {
          from: tableNames.customer,
          localField: "customerId",
          foreignField: "_id",
          as: "customerData",
        },
      },
      {
        $unwind: {
          path: "$customerData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          invoice_no: 1,
          order_status: 1,
          subtotal: 1,
          tax: 1,
          total: 1,
          customerId: 1,
          customerName: 1,
          customerEmail: 1,
          customerPhone: 1,
          customerAddress: 1,
          products: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                productId: "$$product.productId",
                productName: "$$product.productName",
                categoryName: "$$product.categoryName",
                quantity: "$$product.quantity",
                price: "$$product.price",
              },
            },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const order = await OrderSchemaModel.aggregate(pipeline);
    if (!order.length) {
      throw new Error(messages.data_not_found);
    }
    return order[0];
  } catch (error) {
    throw new Error(messages.fetching_failed + error.message);
  }
};

export const deleteById = async (id) => {
  const order = await OrderSchemaModel.findById(id);
  if (!order) {
    throw new Error(messages.data_not_found);
  }
  return await order.save();
};
