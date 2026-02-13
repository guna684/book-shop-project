import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    const email = 'newadmin@sricholabookshop.com'; // Change as needed
    const password = 'NewAdmin@2026'; // Change as needed
    const name = 'New Admin';

    const userExists = await User.findOne({ email });
    if (userExists) {
      console.log('Admin user already exists');
      process.exit();
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const adminUser = new User({
      name,
      email,
      password: hashedPassword,
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
