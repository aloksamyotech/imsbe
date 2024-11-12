import UnitSchemaModel from "../models/unit.js";
import url from "url";

export const save = async (req) => {
  try {
    const { unitnm, shortcode } = req?.body;
    const unitModel = UnitSchemaModel({
      unitnm,
      shortcode,
    });
    return await unitModel.save();
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const fetch = async (req) => {
  try {
    const condition_obj = url.parse(req.url, true).query;
    const unitList = await UnitSchemaModel.find(condition_obj);
    return unitList;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const update = async (id, updateData) => {
  try {
    const updatedUnit = await UnitSchemaModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    return updatedUnit;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const deleteById = async (id) => {
  const unit = await UnitSchemaModel.findById(id);
  if (!unit) {
    throw new Error("unit not found");
  }
  unit.isDeleted = true;
  await unit.save();
  return unit;
};
