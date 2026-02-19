/**
 * Migration: assign-user-to-resources
 *
 * Assigns all Hive and Apiary documents that have no userId to a given user.
 *
 * Usage:
 *   npx ts-node -r tsconfig-paths/register scripts/assign-user-to-resources.ts --email=you@example.com
 *   npx ts-node -r tsconfig-paths/register scripts/assign-user-to-resources.ts --email=you@example.com --dry-run
 */

import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

const MONGO = process.env.MONGODB_URI || 'mongodb://localhost:27017/hivecards';

function parseArgs(): { email: string | null; userId: string | null; dryRun: boolean } {
  const args = process.argv.slice(2);
  const emailArg = args.find((a) => a.startsWith('--email='));
  const userIdArg = args.find((a) => a.startsWith('--user-id='));
  return {
    email: emailArg ? emailArg.split('=')[1] : null,
    userId: userIdArg ? userIdArg.split('=')[1] : null,
    dryRun: args.includes('--dry-run'),
  };
}

async function run() {
  const opts = parseArgs();

  if (!opts.email && !opts.userId) {
    console.error('Error: provide --email=<email> or --user-id=<id>');
    process.exit(1);
  }

  await mongoose.connect(MONGO);
  console.log('Connected to', MONGO);

  const db = mongoose.connection.db!;

  // Resolve user ID
  let userId: string;
  if (opts.userId) {
    userId = opts.userId;
  } else {
    const user = await db.collection('users').findOne({ email: opts.email });
    if (!user) {
      console.error(`No user found with email="${opts.email}"`);
      await mongoose.disconnect();
      process.exit(1);
    }
    userId = user._id.toString();
    console.log(`Resolved user: email=${user.email} id=${userId} username=${user.username ?? '—'}`);
  }

  // Count affected documents
  const hivesCount = await db
    .collection('hives')
    .countDocuments({ userId: { $exists: false } });
  const apiariesCount = await db
    .collection('apiaries')
    .countDocuments({ userId: { $exists: false } });

  console.log(`\nDocuments missing userId:`);
  console.log(`  Hives:    ${hivesCount}`);
  console.log(`  Apiaries: ${apiariesCount}`);

  if (hivesCount === 0 && apiariesCount === 0) {
    console.log('\nNothing to migrate.');
    await mongoose.disconnect();
    return;
  }

  if (opts.dryRun) {
    console.log('\n--dry-run: no changes written.');
    await mongoose.disconnect();
    return;
  }

  const hiveResult = await db
    .collection('hives')
    .updateMany({ userId: { $exists: false } }, { $set: { userId } });
  console.log(`\nHives updated:    ${hiveResult.modifiedCount}`);

  const apiaryResult = await db
    .collection('apiaries')
    .updateMany({ userId: { $exists: false } }, { $set: { userId } });
  console.log(`Apiaries updated: ${apiaryResult.modifiedCount}`);

  console.log('\nMigration complete.');
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
