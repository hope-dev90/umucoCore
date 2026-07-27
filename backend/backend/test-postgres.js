import { connectDB } from './config/db.js';
import { createUser, findUserByEmail, markEmailVerified, saveOtp, verifyOtp, clearOtp } from './models/userModels.js';
import bcrypt from 'bcryptjs';

const testPostgres = async () => {
  try {
    console.log('Testing PostgreSQL connection and models...');
    
    // Connect to DB
    await connectDB();
    console.log('✅ Connected to PostgreSQL');

    // Test 1: Create a test user
    const testEmail = 'test@example.com';
    const hashedPassword = await bcrypt.hash('test123456', 12);
    const user = await createUser({
      name: 'Test User',
      email: testEmail,
      password: hashedPassword,
      role: 'user'
    });
    console.log('✅ Test user created:', user.id, user.name, user.email);

    // Test 2: Find user by email
    const foundUser = await findUserByEmail(testEmail);
    console.log('✅ Found user by email:', foundUser.name);

    // Test 3: Save and verify OTP
    const otp = '123456';
    const expiresAt = new Date(Date.now() + 60000); // 1 min from now
    await saveOtp(testEmail, otp, expiresAt);
    console.log('✅ OTP saved');

    const verifiedUser = await verifyOtp(testEmail, otp);
    console.log('✅ OTP verified:', verifiedUser ? 'success' : 'failed');

    // Test 4: Clear OTP and mark email verified
    await clearOtp(testEmail);
    await markEmailVerified(testEmail);
    console.log('✅ OTP cleared and email marked verified');

    // Final check
    const finalUser = await findUserByEmail(testEmail);
    console.log('✅ Final check - email verified:', finalUser.is_verified);

    console.log('\n🎉 All PostgreSQL tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ PostgreSQL test failed:', error);
    process.exit(1);
  }
};

testPostgres();
