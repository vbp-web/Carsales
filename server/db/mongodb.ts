import mongoose from 'mongoose';

/**
 * MongoDB Atlas Connection Manager
 * Optimized for both persistent Node.js servers and Vercel Serverless Functions.
 * Caches the connection across serverless invocations to avoid exhausting connection pools.
 */

interface MongoConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongoConnectionCache | undefined;
}

let cached: MongoConnectionCache = global._mongooseCache || { conn: null, promise: null };
if (!global._mongooseCache) {
  global._mongooseCache = cached;
}

export interface MongoStatus {
  isConnected: boolean;
  readyState: number; // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  stateDescription: string;
  databaseName?: string;
  host?: string;
  error?: string;
}

const STATE_DESCRIPTIONS: Record<number, string> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

export async function connectMongoDB(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI || process.env.MONGODB_URL;

  if (!uri) {
    return null;
  }

  // If already connected, return cached connection
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
      autoIndex: true
    };

    console.log('🔄 [MongoDB Atlas] Connecting to database cluster...');

    cached.promise = mongoose
      .connect(uri, opts)
      .then(m => {
        console.log(`✅ [MongoDB Atlas] Connected successfully to database: "${m.connection.name}" on host: ${m.connection.host}`);
        return m;
      })
      .catch(err => {
        console.error('❌ [MongoDB Atlas] Connection error:', err.message);
        cached.promise = null;
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
}

export function getMongoStatus(): MongoStatus {
  const readyState = mongoose.connection.readyState;
  return {
    isConnected: readyState === 1,
    readyState,
    stateDescription: STATE_DESCRIPTIONS[readyState] || 'unknown',
    databaseName: mongoose.connection.name || undefined,
    host: mongoose.connection.host || undefined
  };
}

export async function disconnectMongoDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
    console.log('🔌 [MongoDB Atlas] Disconnected.');
  }
}
