import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { tableNames } from "../common/constant.js";

const CustomerSchema = new mongoose.Schema(
  {
    customernm: {
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
    isWholesale: {
      type: Boolean,
      default: true, 
    },
    accountHolder: {
      type: String,
      trim: true,
    },
    accountNumber: {
      type: Number,
      trim: true,
    },
    bankName: {
      type: String,
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

CustomerSchema.plugin(uniqueValidator);

const CustomerSchemaModel = mongoose.model(tableNames.customer, CustomerSchema);

export default CustomerSchemaModel;
