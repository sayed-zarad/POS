const productService = require("../services/product.service");

async function listProducts(req, res, next) {
  try {
    const result = await productService.listProducts(req.validated.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getProduct(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.status(200).json({ data: product });
  } catch (error) {
    next(error);
  }
}

async function createProduct(req, res, next) {
  try {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ data: product });
  } catch (error) {
    next(error);
  }
}

async function updateProduct(req, res, next) {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json({ data: product });
  } catch (error) {
    next(error);
  }
}

async function deleteProduct(req, res, next) {
  try {
    const product = await productService.deactivateProduct(req.params.id);
    res.status(200).json({ data: product });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
};
