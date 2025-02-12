const jwt = require('jsonwebtoken');
const { updateSessionWssToken } = require('../models/sessionModel.js');
const config = require('../config/env.js');

const generateWSToken = async (req, res) => {
  const token = jwt.sign({ userID: req.userID }, config.jwtSecret, { expiresIn: '500s' });
  await updateSessionWssToken(req.userID, token);
  res.json({ token });
};

const refreshWSToken = async (req, res) => {
  const newToken = jwt.sign({ userID: req.userID }, config.jwtSecret, { expiresIn: '15m' });
  await updateSessionWssToken(req.userID, newToken);
  res.json({ token: newToken });
};

module.exports = { generateWSToken, refreshWSToken };
