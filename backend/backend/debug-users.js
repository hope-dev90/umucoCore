import pool from './config/db.js';

const debugUsers = async () => {
  try {
    console.log('Checking users in PostgreSQL...');
    const result = await pool.query('SELECT id, name, email, is_verified FROM users');
    console.log(`Found ${result.rows.length} users:`);
    result.rows.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Verified: ${user.is_verified}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error checking users:', error);
    process.exit(1);
  }
};

debugUsers();
