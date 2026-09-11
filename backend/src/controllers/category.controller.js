const categoryService = require("../services/category.service");

async function listCategories(req, res, next) {
  try {
    const result = await categoryService.listCategories(req.validated.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getCategory(req, res, next) {
  try {
    const category = await categoryService.getCategoryById(
      req.validated.params.id,
    );
    res.status(200).json({ data: category });
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const category = await categoryService.createCategory(req.body);
    res.status(201).json({ data: category });
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await categoryService.updateCategory(
      req.validated.params.id,
      req.body,
    );
    res.status(200).json({ data: category });
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const category = await categoryService.deactivateCategory(
      req.validated.params.id,
    );
    res.status(200).json({ data: category });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createCategory,
  deleteCategory,
  getCategory,
  listCategories,
  updateCategory,
};
