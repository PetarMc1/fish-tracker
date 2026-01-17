require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI must be set in environment');
  process.exit(1);
}

const args = process.argv.slice(2);
const FLAGS = {
  execute: args.includes('--execute'),
  force: args.includes('--force'),
  dropSource: args.includes('--drop-source'),
  help: args.includes('--help') || args.includes('-h'),
};

if (FLAGS.help) {
  console.log(`Usage: node migrate2onedb.js [--execute] [--force] [--drop-source]\n
Options:
  --execute      actually perform writes (default: dry-run)
  --force        insert even if target collections are non-empty
  --drop-source  drop source collections after successful copy
  --help, -h     show this help
`);
  process.exit(0);
}

async function copyCollection(client, srcDbName, srcCollName, dstDb, dstCollName, options) {
  const srcDb = client.db(srcDbName);
  const srcColl = srcDb.collection(srcCollName);
  const dstColl = dstDb.collection(dstCollName);

  const srcCount = await srcColl.countDocuments();
  const dstCount = await dstColl.countDocuments().catch(() => 0);

  console.log(`- Source: ${srcDbName}.${srcCollName} (${srcCount} docs) -> Target: fishtracker.${dstCollName} (${dstCount} docs)`);

  if (!FLAGS.execute) return { copied: 0, skipped: true };

  if (dstCount > 0 && !FLAGS.force) {
    console.warn(`  Skipping: target collection not empty (use --force to override)`);
    return { copied: 0, skipped: true };
  }

  const cursor = srcColl.find();
  const batch = [];
  const BATCH_SIZE = 500;
  let copied = 0;

  try {
    while (await cursor.hasNext()) {
      const doc = await cursor.next()
      batch.push(doc);
      if (batch.length >= BATCH_SIZE) {
        await dstColl.insertMany(batch);
        copied += batch.length;
        batch.length = 0;
      }
    }
    if (batch.length > 0) {
      await dstColl.insertMany(batch);
      copied += batch.length;
    }
  } catch (err) {
    console.error('  Failed during copy:', err.message || err);
    throw err;
  }

  if (FLAGS.dropSource) {
    await srcColl.drop().catch(() => {});
    console.log(`  Dropped source collection ${srcDbName}.${srcCollName}`);
  }

  return { copied, skipped: false };
}

async function migrate() {
  const client = new MongoClient(MONGO_URI);
  await client.connect();
  console.log('Connected to MongoDB');

  try {
    const admin = client.db().admin();
    const { databases } = await admin.listDatabases();
    const srcDbs = databases.map(d => d.name);

    const fishtrackerDb = client.db('fishtracker');

    if (srcDbs.includes('core_users_data')) {
      console.log('\nProcessing core_users_data -> fishtracker');
      const coreDb = client.db('core_users_data');
      const colls = await coreDb.listCollections().toArray();
      for (const c of colls) {
        const name = c.name;
        if (name.startsWith('system.')) continue;
        if (['users', 'admins', 'api_keys'].includes(name)) {
          console.log(`Copying core collection: ${name}`);
          if (FLAGS.execute) {
            const docs = await coreDb.collection(name).find().toArray();
            if (docs.length > 0) {
              await fishtrackerDb.collection(name).insertMany(docs);
              console.log(`  Inserted ${docs.length} docs into fishtracker.${name}`);
            } else {
              console.log('  No documents to copy');
            }
            if (FLAGS.dropSource) {
              await coreDb.collection(name).drop().catch(() => {});
              console.log(`  Dropped core_users_data.${name}`);
            }
          } else {
            const cnt = await coreDb.collection(name).countDocuments();
            console.log(`  Dry-run: would copy ${cnt} docs from core_users_data.${name} to fishtracker.${name}`);
          }
        }
      }
    }

    for (const dbName of srcDbs) {
      if (!dbName.startsWith('user_data_fish_') && !dbName.startsWith('user_data_crab_')) continue;

      const isFish = dbName.startsWith('user_data_fish_');
      const gamemode = dbName.split('_').slice(3).join('_') || 'unknown';
      console.log(`\nProcessing ${dbName} (gamemode=${gamemode})`);

      const srcDb = client.db(dbName);
      const collections = await srcDb.listCollections().toArray();

      for (const c of collections) {
        const userColl = c.name;
        if (userColl.startsWith('system.')) continue;
        const userName = userColl;
        const dstCollName = isFish ? `fish_${userName}_${gamemode}` : `crab_${userName}_${gamemode}`;

        try {
          const result = await copyCollection(client, dbName, userColl, fishtrackerDb, dstCollName, {});
          if (!FLAGS.execute) {
          } else if (result.copied > 0) {
            console.log(`  Copied ${result.copied} documents to fishtracker.${dstCollName}`);
          }
        } catch (err) {
          console.error(`  Failed to migrate collection ${dbName}.${userColl}:`, err.message || err);
        }
      }
    }

    console.log('\nMigration plan complete');
    if (!FLAGS.execute) {
      console.log('Dry-run mode: no writes performed. Re-run with --execute to apply changes.');
    } else {
      console.log('Execution complete.');
    }
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

migrate().catch(err => {
  console.error('Migration failed:', err.message || err);
  process.exit(1);
});
