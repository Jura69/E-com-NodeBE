"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");
const _SECOND = 5000;
// count connect
const countConnect = () => {
  const numConnection = mongoose.connections.length;
  console.log(`Number connections: ${numConnection}`);
};

//check over load
const checkOverload = () => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    // example max nums of connections base on nums of cores
    const maxConnections = numCores * 5;

    //console.log(`Active`)
    //console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB`)

    if (numConnection > maxConnections) {
      console.log("Connection overload detected");
    }
  }, _SECOND); //5sec
};

module.exports = {
  countConnect,
  checkOverload,
};
