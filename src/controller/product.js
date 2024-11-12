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
    console.error(error);
    res.status(statusCodes.internalServerError).json({
      error: error.message || "An error occurred while fetching the products.",
    });
  }
};

export const updateProduct = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(statusCodes.badRequest).json({ message: "product ID is required" });
  }
  const updateData = req.body;
  try {
    const updatedProduct = await update(id, updateData);
    if (!updatedProduct) {
      return res .status(statusCodes.notFound).json({ message: messages.not_found });
    }
    return res.status(statusCodes.ok).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(statusCodes.internalServerError).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(statusCodes.badRequest).json({ message: "product ID is required" });
  }
  try {
    await deleteById(id);
    res .status(statusCodes.ok) .json({ message: messages.data_deletion_success });
  } catch (error) {
    if (error.message === messages.not_found) {
      return res .status(statusCodes.notFound) .json({ message: messages.data_not_found });
    }
    console.error("Error deleting product:", error);
    res.status(statusCodes.internalServerError).json({message: "Failed to delete product", error: error.message,
    });
  }
};

// export const purchaseProduct = async (req, res) => {
//   const { productId } = req.params;
//   const { quantity } = req.body;

//   try {
//     const updatedProduct = await handlePurchase(productId, quantity);
//     res.status(statusCodes.ok).json(updatedProduct);
//   } catch (error) {
//     res.status(statusCodes.internalServerError).json({ message: error.message });
//   }
// };

// export const orderProduct = async (req, res) => {
//   const { productId } = req.params;
//   const { quantity } = req.body;

//   try {
//     const updatedProduct = await handleOrder(productId, quantity);
//     res.status(statusCodes.ok).json(updatedProduct);
//   } catch (error) {
//     res.status(statusCodes.internalServerError).json({ message: error.message });
//   }
// };
