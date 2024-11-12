import express from "express";
import * as UnitController from "../controller/unit.js";
const unitRouter = express.Router();

unitRouter.post("/save", UnitController.create);
unitRouter.get("/fetch", UnitController.fetch_unit);
unitRouter.patch("/update/:id", UnitController.updateUnit);
unitRouter.delete("/deleteById/:id", UnitController.deleteUnit);

export default unitRouter;
