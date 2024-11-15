import { save, update , fetch , deleteById } from "../services/product.js";
import { statusCodes, messages } from "../common/constant.js";

export const create = async (req, res) => {
  try {
    const productResponse = await save(req);
    res.status(statusCodes.created).json(productResponse);
  } catch (error) {
    res.status(statusCodes.internalServerError).json({error: error, });
  }
};

export const fetch_product = async (req, res) => {
  try {
    const productResponse = await fetch(req);
    if (productResponse.length !== 0) {
      res.status(statusCodes.ok).json(productResponse);
    }
  } catch (error) {
    res.status(statusCodes.internalServerError).json({
      message : messages.fetching_failed
    });
  }
};

export const updateProduct = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(statusCodes.badRequest).json({ message: messages.required });
  }
  const updateData = req.body;
  try {
    const updatedProduct = await update(id, updateData);
    if (!updatedProduct) {
      return res .status(statusCodes.notFound).json({ message: messages.not_found });
    }
    return res.status(statusCodes.ok).json(updatedProduct);
  } catch (error) {
    return res.status(statusCodes.internalServerError).json({
      message: messages.data_update_error
    });
  }
};

export const deleteProduct = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(statusCodes.badRequest).json({ message: messages.required });
  }
  try {
    await deleteById(id);
    res .status(statusCodes.ok) .json({ message: messages.data_deletion_success });
  } catch (error) {
    if (error.message === messages.not_found) {
      return res .status(statusCodes.notFound) .json({ message: messages.data_not_found });
    }
    res.status(statusCodes.internalServerError).json({message: messages.bad_request
    });
  }
};

