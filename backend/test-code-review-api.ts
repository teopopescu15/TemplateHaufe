/**
 * Test script for Code Review API endpoints
 */

const API_BASE = 'http://localhost:9000/api';
const TEST_EMAIL = 'api-test-' + Date.now() + '@example.com'; // Unique test user
const TEST_PASSWORD = 'TestPassword123!';
const TEST_NAME = 'API Test User';

let accessToken = '';
let testIssueId = '';
const TEST_PROJECT_ID = 1;

async function registerUser() {
  console.log('\n1️⃣ Registering test user...');

  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      name: TEST_NAME,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Registration failed: ${error}`);
  }

  console.log(`   ✅ User registered: ${TEST_EMAIL}`);
}

async function verifyEmail() {
  console.log('\n2️⃣ Verifying email (bypassing for test)...');

  // Directly update the database to mark email as verified
  const { exec } = require('child_process');
  await new Promise((resolve, reject) => {
    exec(
      `sudo docker exec haufe-postgres-2 psql -U postgres -d teos_hackathon -c "UPDATE users SET email_verified = true WHERE email = '${TEST_EMAIL}';"`,
      (error: any) => {
        if (error) reject(error);
        else resolve(true);
      }
    );
  });

  console.log('   ✅ Email verified');
}

async function login() {
  console.log('\n3️⃣ Logging in to get access token...');

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Login failed: ${error}`);
  }

  // Extract access token from cookies
  const cookies = response.headers.get('set-cookie') || '';
  const accessTokenMatch = cookies.match(/accessToken=([^;]+)/);

  if (!accessTokenMatch) {
    throw new Error('No access token in response');
  }

  accessToken = accessTokenMatch[1];
  console.log('   ✅ Login successful');
}

async function testHealthCheck() {
  console.log('\n4️⃣ Testing health check endpoint...');

  const response = await fetch(`${API_BASE}/code-review/health`, {
    headers: {
      Cookie: `accessToken=${accessToken}`,
    },
  });

  const data: any = await response.json();
  console.log(`   ✅ Ollama Available: ${data.ollamaAvailable}`);
  console.log(`   ✅ Model Available: ${data.modelAvailable}`);
  console.log(`   ✅ Status: ${data.status}`);
}

async function testSaveConfig() {
  console.log('\n5️⃣ Testing save configuration...');

  const response = await fetch(`${API_BASE}/code-review/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `accessToken=${accessToken}`,
    },
    body: JSON.stringify({
      projectId: TEST_PROJECT_ID,
      enabledGuidelines: ['eslint', 'pep8'],
      enabledDimensions: ['security', 'linting', 'architecture'],
      customInstructions: 'Focus on security issues',
      modelName: 'gpt-oss:120b-cloud',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Save config failed: ${error}`);
  }

  const data: any = await response.json();
  console.log('   ✅ Configuration saved');
  console.log(`   📋 Guidelines: ${data.config.enabledGuidelines.join(', ')}`);
  console.log(`   🎯 Dimensions: ${data.config.enabledDimensions.join(', ')}`);
}

async function testGetConfig() {
  console.log('\n6️⃣ Testing get configuration...');

  const response = await fetch(`${API_BASE}/code-review/config/${TEST_PROJECT_ID}`, {
    headers: {
      Cookie: `accessToken=${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Get config failed: ${error}`);
  }

  const data: any = await response.json();
  console.log('   ✅ Configuration retrieved');
  console.log(`   📋 Model: ${data.config.modelName}`);
  console.log(`   📝 Custom Instructions: ${data.config.customInstructions || 'None'}`);
}

async function testCreateManualIssue() {
  console.log('\n7️⃣ Testing create manual issue...');

  const response = await fetch(`${API_BASE}/code-review/issues`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `accessToken=${accessToken}`,
    },
    body: JSON.stringify({
      projectId: TEST_PROJECT_ID,
      filePath: 'src/test-file.ts',
      lineNumber: 42,
      columnNumber: 10,
      severity: 'warning',
      category: 'linting',
      ruleId: 'TEST-001',
      title: 'Test Manual Issue',
      description: 'This is a test issue created via API',
      suggestion: 'Fix this test issue',
      codeSnippet: 'const test = "example";',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Create issue failed: ${error}`);
  }

  const data: any = await response.json();
  testIssueId = data.issue.id;
  console.log('   ✅ Manual issue created');
  console.log(`   🆔 Issue ID: ${testIssueId}`);
  console.log(`   📍 Location: ${data.issue.filePath}:${data.issue.lineNumber}`);
  console.log(`   🔥 Severity: ${data.issue.severity}`);
}

async function testGetIssues() {
  console.log('\n8️⃣ Testing get issues...');

  const response = await fetch(`${API_BASE}/code-review/issues/${TEST_PROJECT_ID}`, {
    headers: {
      Cookie: `accessToken=${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Get issues failed: ${error}`);
  }

  const data: any = await response.json();
  console.log(`   ✅ Retrieved ${data.issues.length} issue(s)`);

  if (data.issues.length > 0) {
    data.issues.slice(0, 3).forEach((issue: any, idx: number) => {
      console.log(`   ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
      console.log(`      📍 ${issue.filePath}:${issue.lineNumber}`);
    });
  }
}

async function testUpdateIssue() {
  console.log('\n9️⃣ Testing update issue...');

  const response = await fetch(`${API_BASE}/code-review/issues/${testIssueId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Cookie: `accessToken=${accessToken}`,
    },
    body: JSON.stringify({
      title: 'Updated Test Issue',
      description: 'This issue has been updated',
      suggestion: 'Updated suggestion',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Update issue failed: ${error}`);
  }

  const data: any = await response.json();
  console.log('   ✅ Issue updated');
  console.log(`   📝 New title: ${data.issue.title}`);
}

async function testResolveIssue() {
  console.log('\n🔟 Testing resolve issue...');

  const response = await fetch(`${API_BASE}/code-review/issues/${testIssueId}/resolve`, {
    method: 'POST',
    headers: {
      Cookie: `accessToken=${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resolve issue failed: ${error}`);
  }

  const data: any = await response.json();
  console.log('   ✅ Issue resolved');
  console.log(`   📊 Status: ${data.issue.status}`);
  console.log(`   ⏰ Resolved at: ${new Date(data.issue.resolvedAt).toLocaleString()}`);
}

async function testGetResolvedIssues() {
  console.log('\n1️⃣1️⃣ Testing get resolved issues...');

  const response = await fetch(`${API_BASE}/code-review/issues/${TEST_PROJECT_ID}?status=resolved`, {
    headers: {
      Cookie: `accessToken=${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Get resolved issues failed: ${error}`);
  }

  const data: any = await response.json();
  console.log(`   ✅ Retrieved ${data.issues.length} resolved issue(s)`);
}

async function testDeleteIssue() {
  console.log('\n1️⃣2️⃣ Testing delete issue...');

  const response = await fetch(`${API_BASE}/code-review/issues/${testIssueId}`, {
    method: 'DELETE',
    headers: {
      Cookie: `accessToken=${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Delete issue failed: ${error}`);
  }

  const data: any = await response.json();
  console.log('   ✅ Issue deleted');
  console.log(`   💬 ${data.message}`);
}

async function testGetHistory() {
  console.log('\n1️⃣3️⃣ Testing get review history...');

  const response = await fetch(`${API_BASE}/code-review/history/${TEST_PROJECT_ID}?limit=5`, {
    headers: {
      Cookie: `accessToken=${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Get history failed: ${error}`);
  }

  const data: any = await response.json();
  console.log(`   ✅ Retrieved ${data.history.length} review history record(s)`);

  if (data.history.length > 0) {
    data.history.forEach((record: any, idx: number) => {
      console.log(`   ${idx + 1}. Review at ${new Date(record.createdAt).toLocaleString()}`);
      console.log(`      📁 Files: ${record.filesCount} | Issues: ${record.totalIssues}`);
    });
  }
}

async function runTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║         Code Review API Endpoint Tests              ║');
  console.log('╚════════════════════════════════════════════════════════╝');

  try {
    await registerUser();
    await verifyEmail();
    await login();
    await testHealthCheck();
    await testSaveConfig();
    await testGetConfig();
    await testCreateManualIssue();
    await testGetIssues();
    await testUpdateIssue();
    await testResolveIssue();
    await testGetResolvedIssues();
    await testDeleteIssue();
    await testGetHistory();

    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║         All API Tests Passed! ✅                     ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
runTests();
