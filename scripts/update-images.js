import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const PRODUCT_IMAGES = {
  prod_1: "/images/products/prod_1.jpg",
  prod_2: "/images/products/prod_2.jpg",
  prod_3: "/images/products/prod_3.jpg",
  prod_4: "/images/products/prod_4.jpg",
  prod_5: "/images/products/prod_5.jpg",
  prod_6: "/images/products/prod_6.jpg",
  prod_7: "/images/products/prod_7.jpg",
  prod_8: "/images/products/prod_8.jpg"
};

async function updateImages() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('No MONGODB_URI found');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('Connected to MongoDB Atlas');

  const coll = mongoose.connection.db.collection('products');

  for (const [id, url] of Object.entries(PRODUCT_IMAGES)) {
    const res = await coll.updateOne({ id }, { $set: { image: url, imageUrl: url } });
    console.log(`Updated ${id}: matched ${res.matchedCount}, modified ${res.modifiedCount}`);
  }

  console.log('Finished updating MongoDB Atlas product images to local bundle assets.');
  await mongoose.disconnect();
}

updateImages().catch(console.error);
