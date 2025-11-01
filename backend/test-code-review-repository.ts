/**
 * Test script for Code Review Repository
 * Run this inside the backend container to test database operations
 */

import * as repo from './src/repositories/CodeReviewRepository';
import { CreateIssueRequest } from './src/types/codeReview';

async function testCodeReviewRepository() {
  console.log('🧪 Testing Code Review Repository CRUD Operations\n');

  try {
    // Test 1: Create a test issue
    console.log('1️⃣ Testing createIssue()...');
    const newIssue: CreateIssueRequest = {
      projectId: 1, // Using existing project ID
      userId: 11,   // Using existing user ID
      filePath: 'src/test.ts',
      lineNumber: 42,
      columnNumber: 10,
      severity: 'error',
      category: 'security',
      ruleId: 'SQL-INJECTION',
      title: 'Potential SQL Injection Vulnerability',
      description: 'User input is directly concatenated into SQL query',
      suggestion: 'Use parameterized queries instead',
      codeSnippet: 'const query = "SELECT * FROM users WHERE id = " + userId;',
      suggestedFix: 'const query = "SELECT * FROM users WHERE id = $1"; pool.query(query, [userId]);',
    };

    const createdIssue = await repo.createIssue({ ...newIssue, isManual: false });
    console.log('✅ Issue created:', {
      id: createdIssue.id,
      title: createdIssue.title,
      severity: createdIssue.severity,
      status: createdIssue.status,
    });
    console.log('');

    // Test 2: Retrieve the issue
    console.log('2️⃣ Testing getIssueById()...');
    const retrievedIssue = await repo.getIssueById(createdIssue.id);
    console.log('✅ Issue retrieved:', retrievedIssue ? 'Found' : 'Not found');
    console.log('');

    // Test 3: Get all active issues for the project
    console.log('3️⃣ Testing getActiveIssues()...');
    const activeIssues = await repo.getActiveIssues(1);
    console.log('✅ Active issues found:', activeIssues.length);
    console.log('');

    // Test 4: Update the issue
    console.log('4️⃣ Testing updateIssue()...');
    const updatedIssue = await repo.updateIssue(createdIssue.id, {
      title: 'UPDATED: Potential SQL Injection Vulnerability',
      suggestion: 'UPDATED: Use parameterized queries with prepared statements',
    });
    console.log('✅ Issue updated:', {
      id: updatedIssue.id,
      title: updatedIssue.title,
      suggestion: updatedIssue.suggestion,
    });
    console.log('');

    // Test 5: Mark as resolved
    console.log('5️⃣ Testing markAsResolved()...');
    const resolvedIssue = await repo.markAsResolved(createdIssue.id, 11);
    console.log('✅ Issue resolved:', {
      id: resolvedIssue.id,
      status: resolvedIssue.status,
      resolvedAt: resolvedIssue.resolvedAt,
      resolvedBy: resolvedIssue.resolvedBy,
    });
    console.log('');

    // Test 6: Check for re-appearance
    console.log('6️⃣ Testing checkForReappearance()...');
    const reappearedIssue = await repo.checkForReappearance(
      1,
      'src/test.ts',
      42,
      'SQL-INJECTION'
    );
    console.log('✅ Re-appearance check:', reappearedIssue ? 'Found previous issue' : 'No previous issue');
    console.log('');

    // Test 7: Create issue with re-appearance tracking
    console.log('7️⃣ Testing createIssueWithReappearance()...');
    const reappearedNewIssue = await repo.createIssueWithReappearance(newIssue, reappearedIssue);
    console.log('✅ Re-appeared issue created:', {
      id: reappearedNewIssue.id,
      wasResolvedBefore: reappearedNewIssue.wasResolvedBefore,
      resolutionCount: reappearedNewIssue.resolutionCount,
    });
    console.log('');

    // Test 8: Save config
    console.log('8️⃣ Testing saveConfig()...');
    const config = await repo.saveConfig({
      projectId: 1,
      userId: 11,
      enabledGuidelines: ['eslint', 'pep8'],
      enabledDimensions: ['security', 'linting', 'architecture'],
      customInstructions: 'Follow our company coding standards',
      modelName: 'gpt-oss:120b-cloud',
    });
    console.log('✅ Config saved:', {
      id: config.id,
      projectId: config.projectId,
      enabledGuidelines: config.enabledGuidelines,
      enabledDimensions: config.enabledDimensions,
    });
    console.log('');

    // Test 9: Get config
    console.log('9️⃣ Testing getConfig()...');
    const retrievedConfig = await repo.getConfig(1);
    console.log('✅ Config retrieved:', retrievedConfig ? 'Found' : 'Not found');
    console.log('');

    // Test 10: Create review history
    console.log('🔟 Testing createReviewHistory()...');
    const history = await repo.createReviewHistory({
      projectId: 1,
      userId: 11,
      filesReviewed: ['src/test.ts', 'src/another.ts'],
      filesCount: 2,
      totalIssues: 5,
      newIssues: 3,
      reappearedIssues: 2,
      reviewDurationMs: 1500,
      modelUsed: 'gpt-oss:120b-cloud',
    });
    console.log('✅ Review history created:', {
      id: history.id,
      filesCount: history.filesCount,
      totalIssues: history.totalIssues,
    });
    console.log('');

    // Test 11: Get review stats
    console.log('1️⃣1️⃣ Testing getReviewStats()...');
    const stats = await repo.getReviewStats(1);
    console.log('✅ Review stats:', {
      totalReviews: stats.totalReviews,
      totalIssuesFound: stats.totalIssuesFound,
      averageDurationMs: stats.averageDurationMs,
    });
    console.log('');

    // Test 12: Delete the test issues
    console.log('1️⃣2️⃣ Testing deleteIssue()...');
    await repo.deleteIssue(createdIssue.id, 11);
    await repo.deleteIssue(reappearedNewIssue.id, 11);
    console.log('✅ Test issues deleted');
    console.log('');

    console.log('🎉 All tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testCodeReviewRepository();
