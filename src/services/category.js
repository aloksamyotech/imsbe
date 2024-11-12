import CategorySchemaModel from "../models/category.js";
import url from "url";

export const save = async (req) => {
  try {
    const { catnm, desc } = req?.body;
    const categoryModel = CategorySchemaModel({
      catnm,
      desc,
    });
    return await categoryModel.save();
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const fetch = async (req) => {
  try {
    const condition_obj = req?.query;
    const categoryList = await CategorySchemaModel.find({...condition_obj, isDeleted: false,});
    return categoryList;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const update = async (id, updateData) => {
  try {
    const updatedCategory = await CategorySchemaModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    return updatedCategory;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const deleteById = async (id) => {
  const category = await CategorySchemaModel.findById(id);
  if (!category) {
    throw new Error("category not found");
  }
  category.isDeleted = true;
  await category.save();
  return category;
};
