import CustomerSchemaModel from "../models/customer.js";

export const save = async (req) => {
  try {
    const {
      customernm,
      email,
      phone,
      address,
      isWholesale,  
      accountHolder,
      accountNumber,
      bankName,
    } = req?.body;

    const customerModel = new CustomerSchemaModel({
      customernm,
      email,
      phone,
      address,
      isWholesale,  
      accountHolder,
      accountNumber,
      bankName,
    });

    return await customerModel.save();
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const fetch = async (req) => {
  try {
    const { isWholesale } = req?.query;
    let customersList;

    if (isWholesale !== undefined) {
      customersList = await CustomerSchemaModel.find({
        isWholesale: isWholesale,  
        isDeleted: false,
      });
    } else {
      customersList = await CustomerSchemaModel.find({
        isDeleted: false,
      });
    }
    return customersList;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Failed to fetch customers");
  }
};

export const update = async (id, updateData) => {
  try {
      const updatedCustomer = await CustomerSchemaModel.findByIdAndUpdate(
          id,
          updateData,
          { new: true }
      );
      if (!updatedCustomer || updatedCustomer.isDeleted) {
          throw new Error("Customer not found or already deleted");
      }
      return updatedCustomer;
  } catch (error) {
      console.error("Error updating Customer:", error);
      throw new Error("Failed to update Customer");
  }
};

export const deleteById = async (id) => {
  const customer = await CustomerSchemaModel.findById(id);
  if (!customer) {
    throw new Error("customer not found");
  }
  customer.isDeleted = true;
  await customer.save();
  return customer;
};
