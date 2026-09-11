const inventoryService = require("../services/inventory.service");

async function listInventory(req, res, next) {
  try {
    const result = await inventoryService.listInventory(req.validated.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getInventory(req, res, next) {
  try {
    const inventory = await inventoryService.getInventoryByProductId(
      req.validated.params.productId,
    );
    res.status(200).json({ data: inventory });
  } catch (error) {
    next(error);
  }
}

async function increaseProductQuantity(req, res, next) {
  try {
    const inventory = await inventoryService.increaseProductQuantity(
      req.validated.params.productId,
      req.validated.body.quantity,
    );

    res.status(200).json({ data: inventory });
  } catch (error) {
    next(error);
  }
}

async function setProductQuantity(req, res, next) {
  try {
    const inventory = await inventoryService.setProductQuantity(
      req.validated.params.productId,
      req.validated.body.quantity,
    );
    res.status(200).json({ data: inventory });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getInventory,
  increaseProductQuantity,
  listInventory,
  setProductQuantity,
};
