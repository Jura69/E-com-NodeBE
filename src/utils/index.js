"use strict";

const _ = require("lodash");

const getIntoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};


// [a, b, c] => {a: 1, b: 1, c: 1}
const getSelectData = (selcet = []) => {
  return Object.fromEntries(selcet.map(el => [el, 1]));
}

// [a, b, c] => {a: 0, b: 0, c: 0}
const unGetSelectData = (selcet = []) => {
  return Object.fromEntries(selcet.map(el => [el, 0]));
}

module.exports = {
  getIntoData,
  getSelectData,
  unGetSelectData,
};

