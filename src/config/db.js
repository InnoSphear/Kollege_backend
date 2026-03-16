import mongoose from 'mongoose';

export const connectDb = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI missing');

  await mongoose.connect(uri, {
    autoIndex: process.env.NODE_ENV !== 'production',
    maxPoolSize: 30,
  });

  console.log('MongoDB connected');
};
