"use strict";

const e = require("express");
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

const removeUndefinedObject = obj => {
  Object.keys(obj).forEach(k => {
    if (obj[k] == undefined || obj[k] == null) {
      delete obj[k];
    }
  })
  return obj;
}

const updateNestedObjectParser = obj => {
  const final = {};

  Object.keys(obj).forEach(k => {
    if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
      const response = updateNestedObjectParser(obj[k]);
      Object.keys(response).forEach(a => {
        final[`${k}.${a}`] = response[a]; 
      });
    }else {
      final[k] = obj[k];
    } 
  });

  return final;
};

const cleanAndFlattenObject = (obj) => {
  const final = {};

  Object.keys(obj).forEach((k) => {
    const value = obj[k];

    // Remove undefined or null values
    if (value == undefined || value == null) {
      return;
    }

    // Flatten nested objects
    if (typeof value === 'object' && !Array.isArray(value)) {
      const response = cleanAndFlattenObject(value);
      Object.keys(response).forEach((a) => {
        final[`${k}.${a}`] = response[a];
      });
    } else {
      final[k] = value;
    }
  });

  return final;
};


module.exports = {
  getIntoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser,
  cleanAndFlattenObject,
};

