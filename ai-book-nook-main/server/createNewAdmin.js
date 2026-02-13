import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const createNewAdmin = async () => {
    // Wait for database connection
    await connectDB();
    try {
        const email = 'admin@sricholabookshop.com';
        const password = 'Admin@2026!Secure';
        const name = 'Sri Chola Admin';

        console.log('🔍 Checking if admin user already exists...');
        const userExists = await User.findOne({ email });

        if (userExists) {
            console.log('⚠️  Admin user already exists with email:', email);
            console.log('📧 Email:', userExists.email);
            console.log('👤 Name:', userExists.name);
            console.log('🔐 Admin Status:', userExists.isAdmin);

            // Update password if user exists
            console.log('\n🔄 Updating password for existing admin...');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            userExists.password = hashedPassword;
            await userExists.save();
            console.log('✅ Password updated successfully!');
            console.log('\n📝 Admin Credentials:');
            console.log('   Email:', email);
            console.log('   Password:', password);
            process.exit(0);
        }

        console.log('✨ Creating new admin user...');

        // Hash password manually to avoid double-hashing
        // (User model has a pre-save hook that hashes, but we're being explicit here)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const adminUser = new User({
            name,
            email,
            password: hashedPassword,
            isAdmin: true,
        });

        await adminUser.save();

        console.log('\n✅ New admin user created successfully!');
        console.log('\n📝 Admin Credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('   Name:', name);
        console.log('\n🎯 You can now login at: http://localhost:8080/login');
        console.log('   Select "Admin Login" and use the credentials above.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating admin user:', error.message);
        console.error(error);
        process.exit(1);
    }
};

createNewAdmin();
