import { save, fetch, update, deleteById } from '../services/supplier.js';
import { statusCodes, messages } from '../common/constant.js';

export const create = async (req, res) => {
  try {
    const supplierResponse = await save(req);
    res.status(statusCodes.created).json(supplierResponse); 
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(statusCodes.internalServerError).json({
      message: "Failed to create supplier",
      error: error.message
    });
  }
};

export const fetch_supplier = async (req, res) => {
  try {
    const supplierResponse = await fetch(req);
    if (supplierResponse.length === 0) {
      return res.status(statusCodes.notFound).json({ message: "No suppliers found." });
    }
    res.status(statusCodes.ok).json(supplierResponse);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(statusCodes.internalServerError).json({
      message: "An error occurred while fetching suppliers.",
      error: error.message
    });
  }
};

export const updateSupplier = async (req, res) => {
  const id  = req.params.id; 
  if (!id) {
    return res.status(statusCodes.badRequest).json({ message: 'Supplier ID is required' });
  }
  const updateData = req.body; 
  try {
    const updatedSupplier = await update(id, updateData);
    if (!updatedSupplier) {
      return res.status(statusCodes.notFound).json({ message: messages.not_found });
    }
    return res.status(statusCodes.ok).json(updatedSupplier);
  } catch (error) {
    console.error("Error updating supplier:", error);
    return res.status(statusCodes.internalServerError).json({ 
      message: "Failed to update supplier", 
      error: error.message 
    });
  }
};

export const deleteSupplier = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(statusCodes.badRequest).json({ message: "Supplier ID is required" });
  }

  try {
    await deleteById(id);
    res.status(statusCodes.ok).json({ message: messages.data_deletion_success });
  } catch (error) {
    if (error.message === messages.not_found) {
      return res.status(statusCodes.notFound).json({ message: messages.data_not_found });
    }
    console.error("Error deleting supplier:", error);
    res.status(statusCodes.internalServerError).json({ 
      message: "Failed to delete supplier", 
      error: error.message 
    });
  }
};
