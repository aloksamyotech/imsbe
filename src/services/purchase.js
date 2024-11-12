import  PurchaseSchemaModel from "../models/purchase.js";
import { tableNames } from "../common/constant.js";
import SupplierSchemaModel from "../models/supplier.js";
import ProductSchemaModel from "../models/products.js";
import mongoose from "mongoose";

export const save = async (req) => {
  const updateProductQuantity = async (productId, quantity) => {
    const product = await ProductSchemaModel.findById(productId);
    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }
    product.quantity = (Number(product.quantity) || 0) + Number(quantity);
    await product.save();
  };
  try {
    const {
      date,
      products, 
      status,
      total,
      subtotal,
      tax,
      supplierId,
    } = req.body;

    const supplier = await SupplierSchemaModel.findById(supplierId);
    if (!supplier) {
      throw new Error("Supplier not found.");
    }

    const productOrders = [];
    for (const product of products) {
      const dbProduct = await ProductSchemaModel.findById(product.productId); 
      if (!dbProduct) {
        throw new Error(`Product not found: ${product.productId}`);
      }

      productOrders.push({
        productId: dbProduct._id,
        productName: dbProduct.productnm,
        categoryName: dbProduct.categoryName,
        quantity: product.quantity,
        price: dbProduct.buyingPrice,
      });
      await updateProductQuantity(product.productId, product.quantity);
    }

    const purchaseModel = new PurchaseSchemaModel({
      date: new Date(date), 
      products: productOrders,
      status: status || 'Pending',
      total,
      subtotal,
      tax,
      supplierId: supplier._id,
      supplierName: supplier.suppliernm,
      supplierEmail: supplier.email,
      supplierPhone: supplier.phone,
    });
    await purchaseModel.save();
    return purchaseModel;
  } catch (error) {
    console.error("Error saving purchase:", error);
    throw new Error("Purchase could not be saved: " + error.message);
  }
};

export const fetch = async (req) => {
  try {
    const condition_obj = { ...req.query };
    const pipeline = [
      { $match: condition_obj },
      {
        $lookup: {
          from: tableNames.supplier,
          localField: "supplierId",
          foreignField: "_id",
          as: "supplierData",
        },
      },
      {
        $unwind: {
          path: "$supplierData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          purchase_no: 1,
          status: 1,
          subtotal: 1,
          tax: 1,
          total: 1,
          supplierId: 1,
          supplierName: 1,
          products: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                productId: "$$product.productId",
                productName: "$$product.productName",
                categoryName: "$$product.categoryName",
                quantity: "$$product.quantity",
                price: "$$product.price",
              },
            },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    const purchaseList = await PurchaseSchemaModel.aggregate(pipeline);
    return purchaseList;
  } catch (error) {
    console.error("Error fetching purchase:", error);
    throw new Error("Failed to fetch purchase: " + error.message);
  }
};

export const fetchById = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }

    const condition_obj = { _id: new mongoose.Types.ObjectId(id) };

    const pipeline = [
      { $match: condition_obj },
      {
        $lookup: {
          from: tableNames.supplier,
          localField: "supplierId",
          foreignField: "_id",
          as: "supplierData",
        },
      },
      {
        $unwind: {
          path: "$supplierData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          purchase_no: 1,
          status: 1,
          subtotal: 1,
          tax: 1,
          total: 1,
          supplierId: 1,
          supplierName: 1,
          supplierEmail: 1,
          supplierPhone: 1,
          products: {
            $map: {
              input: "$products",
              as: "product",
              in: {
                productId: "$$product.productId",
                productName: "$$product.productName",
                categoryName: "$$product.categoryName",
                quantity: "$$product.quantity",
                price: "$$product.price",
              },
            },
          },
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ];

    const purchase = await PurchaseSchemaModel.aggregate(pipeline);
    if (!purchase.length) {
      throw new Error("purchase not found");
    }
    return purchase[0]; 
  } catch (error) {
    console.error("Error fetching purchase by ID:", error);
    throw new Error("Failed to fetch purchase: " + error.message);
  }
};

export const deleteById = async (id) => {
  const purchase = await PurchaseSchemaModel.findById(id);
  if (!purchase) {
    throw new Error("Purchase not found");
  }
  await purchase.save(); 
  return purchase;
};

export const approvePurchase = async (id) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid ID format");
    }
    const purchase = await PurchaseSchemaModel.findById(id);
    if (!purchase) {
      throw new Error("Purchase not found");
    }
    purchase.status = 'Completed';
    await purchase.save();
    return purchase;
  } catch (error) {
    console.error("Error approving purchase:", error);
    throw new Error("Failed to approve purchase: " + error.message);
  }
};


