import dotenv from 'dotenv';
dotenv.config();

console.log('=== RAZORPAY CONFIGURATION CHECK ===\n');

console.log('Environment Variables:');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID || '❌ NOT SET');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? '✅ SET (***' + process.env.RAZORPAY_KEY_SECRET.slice(-4) + ')' : '❌ NOT SET');
console.log('RAZORPAY_ENV:', process.env.RAZORPAY_ENV || '❌ NOT SET');

console.log('\n=== TESTING RAZORPAY SDK ===\n');

try {
    const Razorpay = (await import('razorpay')).default;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        console.log('❌ Cannot initialize Razorpay: Credentials missing');
        console.log('\nFIX: Uncomment these lines in server/.env:');
        console.log('RAZORPAY_KEY_ID=rzp_test_RugjJc7cbew2Ry');
        console.log('RAZORPAY_KEY_SECRET=B3ylqyWaEr2sbeFlI1ZbplzR');
        console.log('RAZORPAY_ENV=TEST');
    } else {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        console.log('✅ Razorpay SDK initialized successfully!');
        console.log('✅ Ready to process payments');

        console.log('\n=== CONFIGURATION SUMMARY ===');
        console.log('Status: READY ✅');
        console.log('Environment: TEST');
        console.log('Key ID:', process.env.RAZORPAY_KEY_ID);
    }
} catch (error) {
    console.error('❌ Error initializing Razorpay:', error.message);
}

console.log('\n=== NEXT STEPS ===');
console.log('1. Stop ALL running servers (Ctrl+C in all terminals)');
console.log('2. Run: npm run dev');
console.log('3. Look for: "✅ Razorpay SDK initialized successfully"');
console.log('4. Test payment on checkout page');
