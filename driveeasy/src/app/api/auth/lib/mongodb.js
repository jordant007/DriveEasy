import { MongoClient } from "mongodb";

let client;
let db;

async function connectToDatabase() {
  if (db) return db;

  client = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await client.connect();
  db = client.db("driveeasy");
  return db;
}

export { connectToDatabase };