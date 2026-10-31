import mongoose from 'mongoose';
import dns from 'dns';
import dotenv from 'dotenv';
dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const PRODUCT_IMAGES = {
  prod_1: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
  prod_2: "https://images.unsplash.com/photo-1534483509719-3feaee7c30da?auto=format&fit=crop&w=800&q=80",
  prod_3: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
  prod_4: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80",
  prod_5: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80",
  prod_6: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80",
  prod_7: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
  prod_8: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=800&q=80"
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

  console.log('Finished updating MongoDB Atlas product images.');
  await mongoose.disconnect();
}

updateImages().catch(console.error);
