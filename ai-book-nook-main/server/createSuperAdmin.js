import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const createAdmin = async () => {
  await connectDB();
  try {
    const email = 'admin@sricholabookshop.com';
    const password = 'Admin@2026';
    const name = 'Super Admin';

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('Admin user already exists:', email);
      process.exit();
    }

    const adminUser = new User({
      name,
      email,
      password,
      isAdmin: true,
    });
    await adminUser.save();
    console.log('New admin user created:', email);
    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();
