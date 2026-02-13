import dotenv from 'dotenv';
import sendEmail from './utils/sendEmail.js';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const testEmailSystem = async () => {
    try {
        console.log('🔍 EMAIL SYSTEM DIAGNOSTIC TEST\n');
        console.log('='.repeat(60));

        // 1. Check Environment Variables
        console.log('\n1️⃣  CHECKING ENVIRONMENT VARIABLES:');
        console.log(`   EMAILJS_SERVICE_ID: ${process.env.EMAILJS_SERVICE_ID ? '✅ Set' : '❌ Missing'}`);
        console.log(`   EMAILJS_TEMPLATE_ID: ${process.env.EMAILJS_TEMPLATE_ID ? '✅ Set' : '❌ Missing'}`);
        console.log(`   EMAILJS_PUBLIC_KEY: ${process.env.EMAILJS_PUBLIC_KEY ? '✅ Set' : '❌ Missing'}`);
        console.log(`   EMAILJS_PRIVATE_KEY: ${process.env.EMAILJS_PRIVATE_KEY ? '✅ Set' : '❌ Missing'}`);

        if (!process.env.EMAILJS_SERVICE_ID || !process.env.EMAILJS_TEMPLATE_ID ||
            !process.env.EMAILJS_PUBLIC_KEY || !process.env.EMAILJS_PRIVATE_KEY) {
            console.log('\n❌ ERROR: EmailJS credentials are missing!');
            console.log('   Please check your .env file.');
            return;
        }

        // 2. Test Forgot Password Email
        console.log('\n2️⃣  TESTING FORGOT PASSWORD EMAIL:');
        const otpTestResult = await sendEmail({
            to: 'egunasekaran56@gmail.com',
            subject: 'TEST: Password Reset OTP - Sri Chola Book Shop',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Password Reset Request (TEST)</h2>
                    <p>This is a TEST email for the forgot password feature.</p>
                    <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
                        123456
                    </div>
                    <p><strong>This OTP is valid for 10 minutes only.</strong></p>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px;">Sri Chola Book Shop - Your Trusted Book Store</p>
                </div>
            `
        });

        if (otpTestResult.success) {
            console.log('   ✅ Forgot Password Email: SUCCESS');
        } else {
            console.log('   ❌ Forgot Password Email: FAILED');
            console.log('   Error:', otpTestResult.error);
        }

        // 3. Test Newsletter Email
        console.log('\n3️⃣  TESTING NEWSLETTER EMAIL:');
        const newsletterTestResult = await sendEmail({
            to: 'egunasekaran56@gmail.com',
            subject: 'TEST: Welcome to Sri Chola Book Shop Newsletter!',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #d97706;">Welcome to Sri Chola Book Shop! (TEST)</h1>
                    <p>Hi there,</p>
                    <p>This is a TEST email for the newsletter feature.</p>
                    <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 0; font-weight: bold;">Here is your welcome gift:</p>
                        <h2 style="margin: 10px 0; color: #d97706;">10% OFF</h2>
                        <p style="margin: 0;">Use code <strong>WELCOME10</strong> at checkout on your first order.</p>
                    </div>
                    <p>Stay tuned for updates on new arrivals, bestsellers, and exclusive offers.</p>
                    <p>Happy Reading,<br/>The Sri Chola Book Shop Team</p>
                </div>
            `
        });

        if (newsletterTestResult.success) {
            console.log('   ✅ Newsletter Email: SUCCESS');
        } else {
            console.log('   ❌ Newsletter Email: FAILED');
            console.log('   Error:', newsletterTestResult.error);
        }

        // 4. Test Invoice Email
        console.log('\n4️⃣  TESTING INVOICE EMAIL:');
        const invoiceTestResult = await sendEmail({
            to: 'egunasekaran56@gmail.com',
            subject: 'TEST: Invoice for Order #TEST123 - Sri Chola Book Shop',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h1 style="color: #d97706;">Invoice (TEST)</h1>
                    <p>Dear Customer,</p>
                    <p>This is a TEST email for the invoice feature.</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr style="background-color: #f3f4f6;">
                            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
                            <th style="padding: 10px; text-align: right; border: 1px solid #ddd;">Price</th>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border: 1px solid #ddd;">Test Book</td>
                            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹500</td>
                        </tr>
                        <tr style="background-color: #f3f4f6; font-weight: bold;">
                            <td style="padding: 10px; border: 1px solid #ddd;">Total</td>
                            <td style="padding: 10px; text-align: right; border: 1px solid #ddd;">₹500</td>
                        </tr>
                    </table>
                    <p>Thank you for your order!</p>
                    <p>Sri Chola Book Shop Team</p>
                </div>
            `
        });

        if (invoiceTestResult.success) {
            console.log('   ✅ Invoice Email: SUCCESS');
        } else {
            console.log('   ❌ Invoice Email: FAILED');
            console.log('   Error:', invoiceTestResult.error);
        }

        // 5. Summary
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST SUMMARY:');
        console.log('   Forgot Password: ' + (otpTestResult.success ? '✅ WORKING' : '❌ NOT WORKING'));
        console.log('   Newsletter: ' + (newsletterTestResult.success ? '✅ WORKING' : '❌ NOT WORKING'));
        console.log('   Invoice: ' + (invoiceTestResult.success ? '✅ WORKING' : '❌ NOT WORKING'));
        console.log('='.repeat(60));

        console.log('\n📧 Check your email inbox: egunasekaran56@gmail.com');
        console.log('   All test emails should arrive within 1-2 minutes.\n');

    } catch (error) {
        console.error('\n❌ FATAL ERROR:', error);
    }
};

testEmailSystem();
