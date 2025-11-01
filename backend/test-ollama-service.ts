/**
 * Test script for Ollama Service and Code Review Service
 */

import { OllamaService } from './src/services/ollamaService';
import { CodeReviewService } from './src/services/codeReviewService';

// Test code with intentional issues
const TEST_CODE = `
// Bad: Hardcoded API key
const API_KEY = "sk_live_1234567890abcdef";

// Bad: SQL injection vulnerability
function getUser(userId: string) {
  const query = "SELECT * FROM users WHERE id = " + userId;
  return db.query(query);
}

// Bad: Missing error handling
async function fetchData(url: string) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Bad: Using var instead of const/let
var count = 0;

// Bad: Unused variable
const unusedVariable = 42;
`;

async function testOllamaService() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║     Ollama Service & Code Review Service Tests       ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const ollamaService = new OllamaService();
  const codeReviewService = new CodeReviewService();

  try {
    // Test 1: Check Ollama connection
    console.log('1️⃣ Testing Ollama Connection...');
    const isConnected = await ollamaService.checkConnection();
    console.log(`   ${isConnected ? '✅' : '❌'} Ollama API: ${isConnected ? 'Available' : 'Not available'}\n`);

    if (!isConnected) {
      console.error('❌ Ollama is not running. Please start Ollama first.');
      process.exit(1);
    }

    // Test 2: Check model availability
    console.log('2️⃣ Testing Model Availability...');
    const modelAvailable = await ollamaService.checkModelAvailability('gpt-oss:120b-cloud');
    console.log(`   ${modelAvailable ? '✅' : '❌'} Model gpt-oss:120b-cloud: ${modelAvailable ? 'Available' : 'Not available'}\n`);

    if (!modelAvailable) {
      console.error('❌ Model gpt-oss:120b-cloud is not available.');
      process.exit(1);
    }

    // Test 3: Review sample code
    console.log('3️⃣ Testing Code Review with Sample Code...');
    console.log('   Reviewing TypeScript code with intentional security and linting issues...\n');

    const reviewResponse = await ollamaService.reviewCode({
      filePath: 'test-file.ts',
      fileContent: TEST_CODE,
      config: {
        projectId: 1,
        userId: 11,
        enabledGuidelines: ['eslint'],
        enabledDimensions: ['security', 'linting'],
        modelName: 'gpt-oss:120b-cloud',
      },
      existingIssues: [],
    });

    console.log(`\n   ✅ Review completed! Found ${reviewResponse.issues.length} issue(s):\n`);

    reviewResponse.issues.forEach((issue, idx) => {
      console.log(`   ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
      console.log(`      📍 Line ${issue.line_number} | ${issue.category} | ${issue.rule_id}`);
      console.log(`      📝 ${issue.description}`);
      if (issue.suggestion) {
        console.log(`      💡 Suggestion: ${issue.suggestion}`);
      }
      console.log('');
    });

    // Test 4: Check health endpoint
    console.log('4️⃣ Testing Health Check...');
    const health = await codeReviewService.checkHealth();
    console.log(`   ✅ Ollama Available: ${health.ollamaAvailable}`);
    console.log(`   ✅ Model Available: ${health.modelAvailable}\n`);

    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║         All Ollama Service Tests Passed! ✅           ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testOllamaService();
