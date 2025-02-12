const express = require('express');
const path = require('path');
const { host } = require('../config/env.js');

const hostMiddleware = (req, res, next) => {
  if (req.hostname === host.main) {
    express.static(path.join(__dirname, '..', 'public', 'main'))(req, res, next);
  } else if (req.hostname === host.admin) {
    express.static(path.join(__dirname, '..', 'public', 'admin'))(req, res, next);
  } else if (req.hostname === host.board) {
    express.static(path.join(__dirname, '..', 'public', 'board'))(req, res, next);
  } else {
    next();
  }
};

module.exports = hostMiddleware;
