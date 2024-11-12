import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { tableNames } from "../common/constant.js";

const CategorySchema = new mongoose.Schema(
  {
    catnm: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      trim: true,
    },
    desc: {
      type: String,
      default: "",
    },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CategorySchema.plugin(uniqueValidator);

CategorySchema.pre("save", function (next) {
  if (this.catnm) {
    this.slug = this.catnm
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

const CategorySchemaModel = mongoose.model(tableNames.pcategory, CategorySchema);

export default CategorySchemaModel;
