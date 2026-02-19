import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/hivecards';

async function run() {
  await mongoose.connect(MONGO);
  console.log('Connected to', MONGO);

  const hiveColl = mongoose.connection.collection('hives');

  // Find string apiaryId values that look like 24-hex ObjectId
  const filter = { apiaryId: { $type: 'string', $regex: /^[0-9a-fA-F]{24}$/ } } as any;
  const count = await hiveColl.countDocuments(filter);
  console.log(`Hives with string ObjectId-like apiaryId: ${count}`);
  if (count === 0) {
    console.log('Nothing to convert.');
    await mongoose.disconnect();
    return;
  }

  // Use updateMany with pipeline to convert string to ObjectId
  const res = await hiveColl.updateMany(filter, [
    { $set: { apiaryId: { $toObjectId: '$apiaryId' } } },
  ]);

  console.log(`Modified count: ${res.modifiedCount}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Conversion failed', err);
  process.exit(1);
});
