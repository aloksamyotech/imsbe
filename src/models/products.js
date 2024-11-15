import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { tableNames } from "../common/constant.js";
import CategorySchemaModel from "./category.js";
import UnitSchemaModel from "./unit.js";

const ProductSchema = new mongoose.Schema(
  {
    productnm: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    buyingPrice: {
      type: Number,
      required: true,
      trim: true,
    },
    sellingPrice: {
      type: Number,
      required: true,
      trim: true,
    },
    quantity: { 
      type: Number,
       required: true, 
       default: 0,
    },
    tax: {
      type: Number,
      required: true,
      trim: true,
    },
    margin: {
      type: Number,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableNames.pcategory,
      required: true,
    },
    categoryName: {
      type: String,
      trim: true,
    },
    unitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: tableNames.punit,
      required: true, 
    },
    unitName: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ProductSchema.plugin(uniqueValidator);

ProductSchema.pre("save", async function (next) {
  if (this.categoryId) {
    const category = await CategorySchemaModel.findById(this.categoryId);
    this.categoryName = category ? category.catnm : null; 
  }

  if (this.unitId) {
    const unit = await UnitSchemaModel.findById(this.unitId);
    this.unitName = unit ? unit.unitnm : null; 
  }

  if (this.productnm) {
    this.slug = this.productnm
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }

  next();
});

const ProductSchemaModel = mongoose.model(tableNames.products, ProductSchema);

export default ProductSchemaModel;
