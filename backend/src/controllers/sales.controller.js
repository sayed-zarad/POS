const salesService = require("../services/sales.service");

async function createSale(req, res, next) {
  try {
    const sale = await salesService.createSale({
      userId: req.user.id,
      ...req.validated.body,
    });
    res.status(201).json({ data: sale });
  } catch (error) {
    next(error);
  }
}

async function listSales(req, res, next) {
  try {
    const result = await salesService.listSales(req.validated.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getSale(req, res, next) {
  try {
    const sale = await salesService.getSaleById(req.validated.params.id);
    res.status(200).json({ data: sale });
  } catch (error) {
    next(error);
  }
}

async function cancelSale(req, res, next) {
  try {
    const sale = await salesService.cancelSale(req.validated.params.id);
    res.status(200).json({ data: sale });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createSale,
  listSales,
  getSale,
  cancelSale,
};
