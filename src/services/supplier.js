import SupplierSchemaModel from "../models/supplier.js";

export const save = async (req) => {
    try {
        const { suppliernm, email, phone, address, typeOfSupplier, shopName, bankName, accountHolder, accountNumber } = req.body;
        const supplierModel = new SupplierSchemaModel({
            suppliernm, email, phone, address, typeOfSupplier, shopName, bankName, accountHolder, accountNumber
        });
        return await supplierModel.save();
    } catch (error) {
        console.error("Error saving supplier:", error);
        throw new Error("Failed to save supplier");
    }
}

export const fetch = async (req) => {
    try {
        const condition_obj = req.query; 
        const suppliersList = await SupplierSchemaModel.find({ ...condition_obj, isDeleted: false }); 
        return suppliersList;
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        throw new Error("Failed to fetch suppliers");
    }
};

export const update = async (id, updateData) => {
    try {
        const updatedSupplier = await SupplierSchemaModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        if (!updatedSupplier || updatedSupplier.isDeleted) {
            throw new Error("Supplier not found or already deleted");
        }
        return updatedSupplier;
    } catch (error) {
        console.error("Error updating supplier:", error);
        throw new Error("Failed to update supplier");
    }
};

export const deleteById = async (id) => {
    const supplier = await SupplierSchemaModel.findById(id);
    if (!supplier) {
        throw new Error("Supplier not found");
    }
    supplier.isDeleted = true;
    await supplier.save();
    return supplier;
};
