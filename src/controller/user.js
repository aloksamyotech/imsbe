import { save , login , update , deleteById , fetch , fetchById , changePasswordService } from "../services/user.js";
import { messages, statusCodes } from "../common/constant.js";
import { authenticateJWT } from "../middleware/authMiddleware.js"; 

export const create = async (req, res) => {
  try {
    const userResponse = await save(req);
    res.status(statusCodes.ok).json(userResponse);
  } catch (error) {
    res.status(statusCodes.created).json(error);
  }
};

export const fetchUser = async (req, res) => {
  try {
    const userResponse = await fetch(req);
    if (userResponse.length !== 0) {
      res.status(statusCodes.ok).json(userResponse);
    }
  } catch (error) {
    console.error(error);
    res.status(statusCodes.internalServerError).json(error);
  }
};

export const fetchById_User = async (req, res) => {
    try {
      const id = req.params.id;
      console.log('User ID:', id);
      const user = await fetchById(id); 
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      return res.status(200).json(user); 
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  };

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const result = await login(email, password);
  if (result.success) {
    return res
      .status(statusCodes.ok)
      .json({ jwtToken: result.jwtToken, user: result.user });
  } else {
    return res
      .status(statusCodes.unauthorized)
      .json({ message: result.message });
  }
};

export const updateUser = async (req, res) => {
  const id  = req.params.id; 
  if (!id) {
    return res.status(statusCodes.badRequest).json({ message: 'User ID is required' });
  }
  const updateData = req.body; 
  try {
    const updatedUser = await update(id, updateData);
    if (!updatedUser) {
      return res.status(statusCodes.notFound).json({ message: messages.not_found });
    }
    return res.status(statusCodes.ok).json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(statusCodes.internalServerError).json({ 
      message: "Failed to update user", 
      error: error.message 
    });
  }
};

export const deleteUser = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(statusCodes.badRequest).json({ message: "user ID is required" });
  }
  try {
    await deleteById(id);
    res.status(statusCodes.ok).json({ message: messages.data_deletion_success });
  } catch (error) {
    if (error.message === messages.not_found) {
      return res.status(statusCodes.notFound).json({ message: messages.data_not_found });
    }
    console.error("Error deleting user:", error);
    res.status(statusCodes.internalServerError).json({ 
      message: "Failed to delete user", 
      error: error.message 
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    console.log('Request Body:', req.body);
    const userId = req.user._id;
  
console.log('User ID:', req.user._id);

    const result = await changePasswordService(userId, currentPassword, newPassword);

    if (result.success) {
      return res.status(200).json({ success: true, message: result.message });
    } else {
      return res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: messages.server_error });
  }
};
