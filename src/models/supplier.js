import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { tableNames } from "../common/constant.js";

const SupplierSchema = new mongoose.Schema(
  {
    suppliernm: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    typeOfSupplier: {
      type: String,
      required: true,
      trim: true,
    },
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      trim: true,
    },
    accountHolder: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: Number,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

SupplierSchema.plugin(uniqueValidator);

const SupplierSchemaModel = mongoose.model(tableNames.supplier, SupplierSchema);

export default SupplierSchemaModel;
