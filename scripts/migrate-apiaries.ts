import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/hivecards';

const palette = ['#EF5350', '#AB47BC', '#5C6BC0', '#29B6F6', '#26A69A', '#66BB6A', '#FFCA28', '#FFA726'];

function colorForName(name: string) {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum = (sum + name.charCodeAt(i)) | 0;
  return palette[Math.abs(sum) % palette.length];
}

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    stringIds: args.includes('--string-ids'),
    setColor: args.includes('--set-color'),
  };
}

async function run() {
  const opts = parseArgs();
  console.log('Migration options:', opts);
  await mongoose.connect(MONGO);
  console.log('Connected to', MONGO);

  const hiveColl = mongoose.connection.collection('hives');
  const apiaryColl = mongoose.connection.collection('apiaries');

  // find distinct apiaryId values stored in hives (old string values)
  const distinct = (await hiveColl.distinct('apiaryId')) as any[];
  const keys = distinct.filter((k) => k !== null && k !== undefined && String(k).trim() !== '');
  console.log('Found distinct apiary keys:', keys);

  // map old string -> new ObjectId
  const mapping: Record<string, mongoose.Types.ObjectId> = {};

  for (const key of keys) {
    const name = String(key);
    // try to find existing apiary by name
    const existing = await apiaryColl.findOne({ name });
    if (existing) {
      mapping[name] = existing._id as mongoose.Types.ObjectId;
      console.log(`Reusing existing apiary for name=${name} -> ${existing._id}`);
      // set color if requested and missing
      if (opts.setColor && !existing.color) {
        const color = colorForName(name);
        if (!opts.dryRun) {
          await apiaryColl.updateOne({ _id: existing._id }, { $set: { color } });
        }
        console.log(`Set color for existing apiary ${name} -> ${color}`);
      }
      continue;
    }

    const newDoc: any = { name, createdAt: new Date(), updatedAt: new Date() };
    if (opts.setColor) newDoc.color = colorForName(name);

    if (opts.dryRun) {
      const fakeId = new mongoose.Types.ObjectId();
      mapping[name] = fakeId;
      console.log(`[dry-run] Would create apiary ${name} -> ${fakeId} (color=${newDoc.color || '(none)'})`);
    } else {
      const res = await apiaryColl.insertOne(newDoc);
      mapping[name] = res.insertedId as mongoose.Types.ObjectId;
      console.log(`Created apiary ${name} -> ${res.insertedId} (color=${newDoc.color || '(none)'})`);
    }
  }

  // Now update hives: for each hive with string apiaryId equal to an old key, set apiaryId to ObjectId or string
  for (const [old, oid] of Object.entries(mapping)) {
    const query = { apiaryId: old };
    const updateValue = opts.stringIds ? String(oid) : oid;
    if (opts.dryRun) {
      const count = await hiveColl.countDocuments(query);
      console.log(`[dry-run] Would update ${count} hives: ${old} -> ${updateValue}`);
      continue;
    }
    const r = await hiveColl.updateMany(query, { $set: { apiaryId: updateValue } });
    console.log(`Updated ${r.modifiedCount} hives: ${old} -> ${updateValue}`);
  }

  console.log('Migration complete');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
