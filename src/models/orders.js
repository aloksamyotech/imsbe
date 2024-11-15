import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { tableNames } from "../common/constant.js";
import ProductSchemaModel from "./products.js";
import CustomerSchemaModel from "./customer.js";

const ProductOrderSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: tableNames.products,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  categoryName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableNames.customer,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: Number,
      required: true,
    },
    customerAddress: {
      type: String,
      required: true,
    },
    products: [ProductOrderSchema],
    order_status: {
      type: String,
      enum: ["Pending", "Completed"],
      default: "Pending",
    },
    invoice_no: {
      type: String,
      unique: true,
    },
    date: {
      type: Date,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    tax: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const generateInvoiceNumber = async () => {
  const lastOrder = await OrderSchemaModel.findOne()
    .sort({ createdAt: -1 })
    .exec();
  const lastInvoiceNumber = lastOrder
    ? parseInt(lastOrder.invoice_no.split("-")[1])
    : 0;
  const newInvoiceNumber = lastInvoiceNumber + 1;

  return `INV-${String(newInvoiceNumber).padStart(4, "0")}`;
};

OrderSchema.pre("save", async function (next) {
  try {
    if (this.isNew) {
      this.invoice_no = await generateInvoiceNumber();
    }

    if (this.productId) {
      const product = await ProductSchemaModel.findById(this.productId);
      if (!product) {
        return next(new Error("Product not found"));
      }
      this.productId = product?._id;
      this.productName = product?.productnm;
      this.categoryName = product?.categoryName;
    }

    if (this.customerId) {
      const customer = await CustomerSchemaModel.findById(this.customerId);
      if (!customer) {
        return next(new Error("Customer not found"));
      }
      this.customerId = customer?._id;
      this.customerName = customer ? customer.customernm : null;
      this.customerEmail = customer ? customer.email : null;
      this.customerPhone = customer ? customer.phone : null;
      this.customerAddress = customer ? customer.address : null;
    }
    next();
  } catch (error) {
    next(error);
  }
});

OrderSchema.plugin(uniqueValidator);

const OrderSchemaModel = mongoose.model(tableNames.orders, OrderSchema);

export default OrderSchemaModel;
