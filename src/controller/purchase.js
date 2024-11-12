import { save , fetch , deleteById , fetchById,   approvePurchase,} from "../services/purchase.js";
import { fetchSupplierProductReport } from "../services/reports.js"; 
import { statusCodes, messages } from "../common/constant.js";

export const create = async (req, res) => {
  try {
    const purchaseResponse = await save(req);
    res.status(statusCodes.created).json(purchaseResponse);
  } catch (error) {
    console.log(error);
    res.status(statusCodes.internalServerError).json({error: error, });
  }
};

export const fetch_purchase = async (req, res) => {
  try {
    const purchaseResponse = await fetch(req);
    if (purchaseResponse.length !== 0) {
      res.status(statusCodes.ok).json(purchaseResponse);
    }
  } catch (error) {
    console.error(error);
    res.status(statusCodes.internalServerError).json({
      error: error.message || "An error occurred while fetching the orders.",
    });
  }
};

export const fetchById_purchase = async (req, res) => {
  const id = req.params.id;
  console.log("Fetching purchase with ID:", id);
  try {
    const purchaseResponse = await fetchById(id); 
    if (purchaseResponse) {
      res.status(statusCodes.ok).json(purchaseResponse);
    } else {
      res.status(statusCodes.notFound).json({
        message: "purchase not found.",
      });
    }
  } catch (error) {
    console.error("Error fetching purchase:", error);
    res.status(statusCodes.internalServerError).json({
      error: error.message || "An error occurred while fetching the purchase.",
    });
  }
};


export const deletePurchase = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(statusCodes.badRequest).json({ message: "Purchase ID is required" });
  }
  try {
    await deleteById(id);
    res .status(statusCodes.ok) .json({ message: messages.data_deletion_success });
  } catch (error) {
    if (error.message === messages.not_found) {
      return res .status(statusCodes.notFound) .json({ message: messages.data_not_found });
    }
    console.error("Error deleting purchase:", error);
    res.status(statusCodes.internalServerError).json({message: "Failed to delete purchase", error: error.message,
    });
  }
};

export const getSupplierProductReport = async (req, res) => {
  try {
    const reportResponse = await fetchSupplierProductReport(req);
      res.status(statusCodes.ok).json(reportResponse);
  } catch (error) {
    console.error(error);
    res.status(statusCodes.internalServerError).json({
      error: error.message || "An error occurred while fetching the data.",
    });
  }
};

export const approvePurchaseController = async (req, res) => {
  try {
    const { id } = req.params; 
    const updatedPurchase = await approvePurchase(id); 
    return res.status(statusCodes.ok).json({
      message: "Purchase approved successfully",
      purchase: updatedPurchase,
    });
  } catch (error) {
    console.error("Error approving purchase:", error);
    return res.status(statusCodes.internalServerError).json({ message: error.message });
  }
};
