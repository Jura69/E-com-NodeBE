import mongoose from 'mongoose';
import os from 'os';
// import process from 'process';

const _SECOND = 5000;

export const countConnect = (): void => {
  const numConnection = mongoose.connections.length;
  console.log(`Number connections: ${numConnection}`);
};

export const checkOverload = (): void => {
  setInterval(() => {
    const numConnection = mongoose.connections.length;
    const numCores = os.cpus().length;
    // const memoryUsage = process.memoryUsage().rss;
    const maxConnections = numCores * 5;

    if (numConnection > maxConnections) {
      console.log('Connection overload detected');
    }
  }, _SECOND);
};

