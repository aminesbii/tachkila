import { MongoClient } from "mongodb";
import { PLAYERS } from "../data/players";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI. Copy .env.example to .env.local and set your connection string.");
    process.exit(1);
  }

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const col = client.db("tachkila").collection("players");
    for (const player of PLAYERS) {
      await col.updateOne({ id: player.id }, { $set: player }, { upsert: true });
    }
    const total = await col.countDocuments();
    console.log(`Seeded ${PLAYERS.length} players. Collection now contains ${total} documents.`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});