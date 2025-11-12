#!/usr/bin/env node

/**
 * 🧪 RSC Admin Mission Control - Admin Accounts Test Script
 *
 * Tests all 5 admin accounts to ensure they work correctly
 */

const http = require('http');

const BASE_URL = process.env.ADMIN_API_URL || 'http://localhost:4000';
const accounts = [
  { email: 'orion.ops@rsc-chain.com', password: 'admin123', role: 'SUPER_ADMIN' },
  { email: 'nova.ops@rsc-chain.com', password: 'nova2024', role: 'OPS_LEAD' },
  { email: 'centauri.ops@rsc-chain.com', password: 'centauri2024', role: 'ANALYST' },
  { email: 'lyra.ops@rsc-chain.com', password: 'lyra2024', role: 'AUDITOR' },
  { email: 'phoenix.ops@rsc-chain.com', password: 'phoenix2024', role: 'VIEWER' },
];

function makeRequest(path, method = 'POST', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 4000,
      path: `/auth${path}`,
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testAccount(account) {
  console.log(`\n🧪 Testing ${account.role}: ${account.email}`);

  try {
    // Test login
    console.log('  📧 Testing login...');
    const loginResponse = await makeRequest('/admin/login', 'POST', {
      email: account.email,
      password: account.password,
    });

    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      console.log('  ❌ Login failed:', loginResponse.data);
      return false;
    }

    const token = loginResponse.data.data.token;
    console.log('  ✅ Login successful');

    // Test basic GraphQL query
    console.log('  🔍 Testing GraphQL access...');
    const graphqlResponse = await makeRequest('/../api/graphql', 'POST', {
      query: `
        query {
          followBonusStats {
            total
            pending
          }
        }
      `,
    }, token);

    if (account.role === 'AUDITOR') {
      // Auditor should NOT have access to follow bonus
      if (graphqlResponse.status === 200 && graphqlResponse.data.errors) {
        console.log('  ✅ Permission correctly denied for AUDITOR');
        return true;
      } else {
        console.log('  ❌ AUDITOR should not have follow bonus access');
        return false;
      }
    } else {
      // Other roles should have access
      if (graphqlResponse.status === 200 && !graphqlResponse.data.errors) {
        console.log('  ✅ GraphQL access granted');
        return true;
      } else {
        console.log('  ❌ GraphQL access denied:', graphqlResponse.data.errors);
        return false;
      }
    }

  } catch (error) {
    console.log('  ❌ Test failed with error:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('🚀 RSC Admin Mission Control - Account Testing');
  console.log('=' .repeat(50));

  let passed = 0;
  let failed = 0;

  for (const account of accounts) {
    const success = await testAccount(account);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 All admin accounts are working correctly!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Check the output above.');
    process.exit(1);
  }
}

// Check if API is running
makeRequest('/health', 'GET')
  .then(() => {
    console.log('✅ API server is running');
    runTests();
  })
  .catch(() => {
    console.log('❌ API server is not running. Start with: pnpm run dev');
    process.exit(1);
  });
