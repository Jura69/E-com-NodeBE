import mongoose from 'mongoose';
import config from '../configs/config.mongodb';
import { countConnect } from '../helpers/check.connect';

const { db } = config;

let connectString: string;
if (db.user && db.password) {
  connectString = `mongodb://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}?authSource=admin`;
} else {
  connectString = `mongodb://${db.host}:${db.port}/${db.name}`;
}

class Database {
  private static instance: Database;

  constructor() {
    this.connect();
  }

  connect(_type = 'mongodb'): void {
    if (1 === 1) {
      mongoose.set('debug', true);
      mongoose.set('debug', { color: true });
    }

    mongoose
      .connect(connectString, {
        maxPoolSize: 50,
      })
      .then((_) => {
        console.log('Connect MongoDB Success', countConnect());
      })
      .catch((err: Error) => console.log('Error Connect MongoDB:', err.message));
  }

  static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

const instanceMongodb = Database.getInstance();
export default instanceMongodb;

