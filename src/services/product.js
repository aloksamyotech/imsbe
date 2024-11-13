import ProductSchemaModel from "../models/products.js";
import { tableNames } from "../common/constant.js";
import CategorySchemaModel from "../models/category.js";
import UnitSchemaModel from "../models/unit.js";

export const save = async (req, res) => {
  try {
    const {
      productnm,
      buyingPrice,
      sellingPrice,
      quantity,
      tax,
      margin,
      notes,
      categoryId,
      unitId,
    } = req.body;
 
    const category = await CategorySchemaModel.findById(categoryId);
    if (!category) {
      throw new Error("Category not found");
    }

    const unit = await UnitSchemaModel.findById(unitId);
    if (!unit) {
      throw new Error("Unit not found");
    }

    const productModel = new ProductSchemaModel({
      productnm,
      buyingPrice,
      sellingPrice,
      quantity,
      tax,
      margin,
      notes,
      categoryId: category._id,
      categoryName: category.catnm,
      unitId: unit._id,
      unitName: unit.unitnm,
    });
    const response= await productModel.save();
    return response;
  } catch (error) {
    console.error("Error saving product:", error);
  }
};

export const fetch = async (req) => {
  try {
    const condition_obj = { ...req.query, isDeleted: false };

    const pipeline = [
      { $match: condition_obj },
      {
        $lookup: {
          from: tableNames.pcategory,
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryData",
        },
      },
      {
        $lookup: {
          from: tableNames.punit,
          localField: "unitId",
          foreignField: "_id",
          as: "unitData",
        },
      },
      {
        $unwind: {
          path: "$categoryData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$unitData",
          preserveNullAndEmptyArrays: true,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const productsList = await ProductSchemaModel.aggregate(pipeline);
    return productsList;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products: " + error.message);
  }
};

export const update = async (id, updateData) => {
  try {
    const updatedProduct = await ProductSchemaModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    if (!updatedProduct || updatedProduct.isDeleted) {
      throw new Error("Product not found or already deleted");
    }
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product: " + error.message);
  }
};

export const deleteById = async (id) => {
  const product = await ProductSchemaModel.findById(id);
  if (!product) {
    throw new Error("Product not found");
  }
  product.isDeleted = true;
  await product.save();
  return product;
};




