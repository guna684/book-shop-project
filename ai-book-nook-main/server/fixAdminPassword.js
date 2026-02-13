import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

const fixAdminPassword = async () => {
    // Wait for database connection
    await connectDB();

    try {
        const email = 'admin@sricholabookshop.com';
        const password = 'Admin@2026!Secure';
        const name = 'Sri Chola Admin';

        console.log('🔍 Finding admin user...');
        const adminUser = await User.findOne({ email });

        if (!adminUser) {
            console.log('❌ Admin user not found. Creating new admin...');

            // Create new admin - let the pre-save hook handle hashing
            const newAdmin = new User({
                name,
                email,
                password, // Plain password - pre-save hook will hash it
                isAdmin: true,
            });

            await newAdmin.save();
            console.log('✅ New admin user created successfully!');
        } else {
            console.log('✅ Admin user found. Updating password...');

            // Update password - this will trigger the pre-save hook
            adminUser.password = password; // Plain password - pre-save hook will hash it
            await adminUser.save();

            console.log('✅ Password updated successfully!');
        }

        console.log('\n📝 Admin Credentials:');
        console.log('   Email:', email);
        console.log('   Password:', password);
        console.log('   Name:', name);
        console.log('\n🎯 You can now login at: http://localhost:8080/login');
        console.log('   Select "Admin Login" and use the credentials above.');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
};

fixAdminPassword();
