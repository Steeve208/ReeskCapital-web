#!/usr/bin/env node

/**
 * Simple test script to verify admin login functionality
 */

const http = require('http');

const BASE_URL = process.env.ADMIN_API_URL || 'http://localhost:4000';

async function testAdminLogin(email, password) {
  console.log(`🧪 Testing admin login for ${email}...`);

  try {
    const response = await fetch(`${BASE_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ Login successful');
      console.log(`   Token: ${data.data.token.substring(0, 20)}...`);
      console.log(`   Role: ${data.data.admin.role}`);
      return { success: true, token: data.data.token };
    } else {
      console.log('❌ Login failed:', data.error);
      return { success: false, error: data.error };
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testProtectedEndpoint(token) {
  console.log('🔐 Testing protected GraphQL endpoint...');

  try {
    const response = await fetch(`${BASE_URL}/api/graphql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          query {
            followBonusStats {
              total
              pending
            }
          }
        `,
      }),
    });

    const data = await response.json();

    if (response.ok && !data.errors) {
      console.log('✅ Protected endpoint accessible');
      console.log(`   Total requests: ${data.data.followBonusStats.total}`);
      return true;
    } else {
      console.log('❌ Protected endpoint failed:', data.errors?.[0]?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 RSC Admin Login Test');
  console.log('=' .repeat(40));

  const accounts = [
    { email: 'orion.ops@rsc-chain.com', password: 'admin123', role: 'SUPER_ADMIN' },
    { email: 'nova.ops@rsc-chain.com', password: 'nova2024', role: 'OPS_LEAD' },
    { email: 'centauri.ops@rsc-chain.com', password: 'centauri2024', role: 'ANALYST' },
  ];

  let passed = 0;
  let failed = 0;

  for (const account of accounts) {
    console.log(`\n👤 Testing ${account.role}`);
    console.log('-'.repeat(30));

    const loginResult = await testAdminLogin(account.email, account.password);

    if (loginResult.success) {
      const protectedTest = await testProtectedEndpoint(loginResult.token);
      if (protectedTest) {
        passed++;
        console.log(`✅ ${account.role} test PASSED`);
      } else {
        failed++;
        console.log(`❌ ${account.role} test FAILED`);
      }
    } else {
      failed++;
      console.log(`❌ ${account.role} login FAILED`);
    }
  }

  console.log('\n' + '='.repeat(40));
  console.log(`📊 Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 All admin login tests passed!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Check the API and database.');
    process.exit(1);
  }
}

// Check if API is running
console.log('🔍 Checking if API is running...');
fetch(`${BASE_URL}/api/health`)
  .then(() => {
    console.log('✅ API is running');
    runTests();
  })
  .catch(() => {
    console.log('❌ API is not running. Start with: pnpm run dev');
    process.exit(1);
  });
