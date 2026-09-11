const userService = require("../services/user.service");

async function listUsers(req, res, next) {
  try {
    const result = await userService.listUsers(req.validated ? req.validated.query : req.query);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

async function getUser(req, res, next) {
  try {
    const userId = req.validated?.params?.id ?? Number(req.params.id);
    const user = await userService.getUserById(userId);
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

async function createUser(req, res, next) {
  try {
    const user = await userService.createUser(req.body);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    const userId = req.validated?.params?.id ?? Number(req.params.id);
    const user = await userService.updateUser(
      userId,
      req.body,
      req.user.id
    );
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const userId = req.validated?.params?.id ?? Number(req.params.id);
    const result = await userService.deleteUser(
      userId,
      req.user.id
    );
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
};
