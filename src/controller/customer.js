import { save , update , fetch , deleteById } from '../services/customer.js';
import { statusCodes, messages } from '../common/constant.js';

export const create = async (req, res) => {
  try {
    const customerResponse = await save(req)
    res.status(statusCodes.ok).json(customerResponse);
  } catch (error) {
    res.status(statusCodes.created).json({
      error: error
    })
  }
}

export const fetch_customer = async (req, res) => {
  try {
    const customerResponse = await fetch(req);
    if (customerResponse.length !== 0) {
      res.status(statusCodes.ok).json(customerResponse);
    }
  }
  catch (error) {
    console.error(error);
    res.status(statusCodes.internalServerError).json({
      error: error.message || 'An error occurred while fetching the customers.'
    });
  }
};


export const updateCustomer = async (req, res) => {
  const id  = req.params.id; 
  if (!id) {
    return res.status(statusCodes.badRequest).json({ message: 'Customer ID is required' });
  }

  console.log('Updating customer with ID:', id);
  const updateData = req.body; 
  try {
    const updatedCustomer = await update(id, updateData);
    if (!updatedCustomer) {
      return res.status(statusCodes.notFound).json({ message: messages.not_found });
    }
    return res.status(statusCodes.ok).json(updatedCustomer);
  } catch (error) {
    console.error("Error updating customer:", error);
    return res.status(statusCodes.internalServerError).json({ 
      message: "Failed to update customer", 
      error: error.message 
    });
  }
};

export const deleteCustomer = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    return res.status(statusCodes.badRequest).json({ message: "customer ID is required" });
  }
  try {
    await deleteById(id);
    res.status(statusCodes.ok).json({ message: messages.data_deletion_success });
  } catch (error) {
    if (error.message === messages.not_found) {
      return res.status(statusCodes.notFound).json({ message: messages.data_not_found });
    }
    console.error("Error deleting customer:", error);
    res.status(statusCodes.internalServerError).json({ 
      message: "Failed to delete customer", 
      error: error.message 
    });
  }
};


