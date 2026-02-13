import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const deleteAdmin = async () => {
  await connectDB();
  try {
    const email = 'admin@sricholabookshop.com';
    const result = await User.deleteOne({ email });
    if (result.deletedCount > 0) {
      console.log('Admin user deleted:', email);
    } else {
      console.log('No admin user found with email:', email);
    }
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

deleteAdmin();
