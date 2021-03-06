const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwtSign = require('../helpers/jwt-sign');
const errors = require('../errors/errors');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

const saltRounds = 10;

const getCurrentUser = (req, res, next) => {
  const { _id } = req.user;
  return User.findOne({ _id })
    .then((user) => {
      if (!user) {
        throw new NotFoundError(errors.noUser);
      }
      res.send(user);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const { email, password } = req.body;
  User
    .findOne({ email })
    .then((user) => {
      if (user) {
        return next(new ConflictError(errors.conflictEmail));
      }
      return bcrypt.hash(password, saltRounds);
    })
    .then((hash) => User.create({ email, password: hash })
      .then(({ _id }) => res.send({ email, _id })))
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => { // +проверка в модели
      const token = jwtSign(user);
      res.send({ token });
    })
    .catch(next);
};

module.exports = {
  getCurrentUser,
  createUser,
  login,
};
