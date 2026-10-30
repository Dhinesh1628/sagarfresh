import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Product } from './models/Product.js';
import { Order } from './models/Order.js';
import { Cooler } from './models/Cooler.js';
import { CoolerReturn } from './models/CoolerReturn.js';

let isConnected = false;

export async function connectMongoDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sagarfresh';
  
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500, // Quick timeout if no local daemon is running
      connectTimeoutMS: 3000
    });
    isConnected = true;
    console.log(`[MongoDB] Connected successfully to: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return true;
  } catch (err) {
    isConnected = false;
    console.warn(`[MongoDB] Notice: Could not connect to MongoDB at "${uri}".`);
    console.warn(`[MongoDB] Running with local persistent document store fallback.`);
    console.warn(`[MongoDB] To connect directly to MongoDB Atlas, set MONGODB_URI in .env or your environment.`);
    return false;
  }
}

export function getMongoStatus() {
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  const stateIndex = mongoose.connection.readyState;
  return {
    configuredUri: process.env.MONGODB_URI ? 'Configured in environment' : 'mongodb://127.0.0.1:27017/sagarfresh (default)',
    status: states[stateIndex] || 'Disconnected',
    isConnected: stateIndex === 1,
    host: mongoose.connection.host || null,
    dbName: mongoose.connection.name || null,
    collections: ['users', 'products', 'orders', 'coolers', 'coolerreturns']
  };
}

export {
  User,
  Product,
  Order,
  Cooler,
  CoolerReturn
};
