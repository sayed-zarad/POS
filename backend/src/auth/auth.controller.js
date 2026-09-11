const authService = require("./auth.service");

async function register(req, res, next) {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({ data: result });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  login,
  me,
  register,
};
