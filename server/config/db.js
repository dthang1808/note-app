import dns from 'node:dns';
import mongoose from 'mongoose';

export default async function connectDB() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required. Add your MongoDB connection string to server/.env.');
  }

  const dnsServers = process.env.MONGODB_DNS_SERVERS
    ?.split(',')
    .map((server) => server.trim())
    .filter(Boolean);

  if (dnsServers?.length) {
    dns.setServers(dnsServers);
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: process.env.MONGODB_DB_NAME || 'note_app',
  });

  console.log(`Connected to MongoDB database "${mongoose.connection.name}".`);
}
