import { encryptText, decryptText } from "../common/helper.js";
import UserSchemaModel from "../models/user.js";
import jwt from "jsonwebtoken";
import { messages } from "../common/constant.js";

export const save = async (req) => {
  try {
    const { name, email, password, phone } = req?.body;
    const existingUser = await UserSchemaModel.findOne({ email });
    if (existingUser) {
      return { success: false, message: messages.already_registered };
    }
    const encryptedPassword = encryptText(password);
    const userModel = new UserSchemaModel({
      name,
      email,
      password: encryptedPassword,
      phone,
    });

    return await userModel.save();
  } catch (error) {
    return { error: error.message };
  }
};

export const fetch = async (req) => {
  try {
    const condition_obj = req?.query;
    const usersList = await UserSchemaModel.find({
      ...condition_obj,
    });
    return usersList;
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const fetchById = async (id) => {
  try {
    const user = await UserSchemaModel.findById(id);
    return user; 
  } catch (error) {
    throw new Error('Error fetching user details: ' + error.message);
  }
};

export const login = async (email, password) => {
  try {
    const user = await UserSchemaModel.findOne({ email });

    if (!user) {
      return { success: false, message: messages.user_not_found };
    }

    const decryptedPassword = decryptText(user.password);
    if (password !== decryptedPassword) {
      return { success: false, message: messages.invalid_credentials };
    }
    const payload = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    const jwtToken = jwt.sign(payload, process.env.SECRET, { expiresIn: '1h' });
    

    return { success: true, jwtToken, user: payload };
  } catch (error) {
    console.error(error);
    return { success: false, message: messages.server_error };
  }
};

export const update = async (id, updateData) => {
  try {
      const updatedUser = await UserSchemaModel.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
      );
      if (!updatedUser || updatedUser.isDeleted) {
          throw new Error("User not found or already deleted");
      }
      return updatedUser;
  } catch (error) {
      console.error("Error updating User:", error);
      throw new Error("Failed to update User");
  }
};

export const deleteById = async (id) => {
  const user = await UserSchemaModel.findById(id);
  if (!user) {
    throw new Error("user not found");
  }
  user.isDeleted = true;
  await user.save();
  return user;
};


export const changePasswordService = async (userId, currentPassword, newPassword) => {
  try {
    const user = await UserSchemaModel.findById(userId);
    if (!user) {
      return { success: false, message: messages.user_not_found };
    }

    const decryptedPassword = decryptText(user.password);
    if (currentPassword !== decryptedPassword) {
      return { success: false, message: messages.invalid_credentials };
    }

    const encryptedNewPassword = encryptText(newPassword);

    user.password = encryptedNewPassword;
    await user.save();

    return { success: true, message: messages.password_changed_successfully };
  } catch (error) {
    console.error(error);
    return { success: false, message: messages.server_error };
  }
};
