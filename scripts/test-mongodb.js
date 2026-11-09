import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { connectMongoDB, getMongoStatus, User, Product, Order, Cooler, CoolerReturn } from '../backend/mongo.js';

async function main() {
  console.log('========================================================');
  console.log('GOMEAT - MONGODB CONNECTION & SCHEMAS TEST');
  console.log('========================================================');
  
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/gomeat';
  console.log(`Connecting to URI: ${uri}`);
  
  const connected = await connectMongoDB();
  const status = getMongoStatus();
  console.log('MongoDB Status:', JSON.stringify(status, null, 2));
  
  console.log('\nMongoose Models Loaded:');
  console.log('- User:', User.modelName);
  console.log('- Product:', Product.modelName);
  console.log('- Order:', Order.modelName);
  console.log('- Cooler:', Cooler.modelName);
  console.log('- CoolerReturn:', CoolerReturn.modelName);
  
  if (connected) {
    const pCount = await Product.countDocuments();
    const uCount = await User.countDocuments();
    console.log(`\nActive MongoDB documents count: Products: ${pCount}, Users: ${uCount}`);
    await mongoose.disconnect();
    console.log('\n✓ MongoDB test completed successfully.');
  } else {
    console.log('\nℹ MongoDB daemon is not running locally.');
    console.log('  To connect to MongoDB Atlas, add your Atlas URI to .env:');
    console.log('  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/sagarfresh');
    console.log('  The app automatically uses the persistent document store fallback so it never crashes.');
  }
}

main().catch(console.error);
