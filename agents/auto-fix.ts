/**
 * Auto-Fix Agent
 * Receives: Entire file content + all issues for that file
 * Returns: Entire file content with ALL issues fixed + detailed fix descriptions
 */

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';
const MODEL_NAME = 'gpt-oss:120b-cloud';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AutoFixRequest {
  filePath: string;
  fileContent: string;      // ENTIRE file as string
  language: string;
  issues: CodeIssue[];      // ALL issues for this file
  projectId: number;
  userId: number;
}

interface AutoFixResponse {
  success: boolean;
  fixedContent: string;        // ENTIRE file with ALL fixes applied
  issues: CodeIssueWithFix[];  // Same issues array with added fixDescription and wasFixed fields
}

interface CodeIssue {
  id: string;
  file_path: string;
  line_number: number;
  column_number?: number;
  end_line_number?: number;
  end_column_number?: number;
  severity: 'error' | 'warning' | 'info';
  category: 'security' | 'architecture' | 'linting' | 'testing' | 'performance';
  rule_id: string;
  title: string;
  description: string;
  suggestion?: string;
  code_snippet?: string;
  suggested_fix?: string;
}

interface CodeIssueWithFix extends CodeIssue {
  fixDescription: string;   // Description of how the agent fixed this issue (or why it couldn't be fixed)
  wasFixed: boolean;        // true if fixed, false if couldn't be fixed
}

interface OllamaMessage {
  role: string;
  content: string;
}

interface OllamaResponse {
  message?: OllamaMessage;
  response?: string;
  done?: boolean;
}

// ============================================================================
// AUTO-FIX AGENT CLASS
// ============================================================================

class AutoFixAgent {
  private buildSystemPrompt(): string {
    return `You are an expert code auto-fixer. Your task is to fix ALL issues in a file and return the COMPLETE fixed file.

🎯 CRITICAL INSTRUCTION: Return the ENTIRE file content with ALL issues fixed.

## Your Responsibilities:
1. Receive a file with multiple issues (errors, warnings, info)
2. Fix ALL issues simultaneously in one pass
3. Return the COMPLETE file with all fixes applied
4. Preserve all code that doesn't need fixing
5. Explain HOW you fixed each issue

## Fixing Approach:
- Read the entire file carefully
- Identify each issue location (line number, description)
- Apply fixes for ALL issues at once
- Ensure fixes don't conflict with each other
- Keep all other code unchanged (comments, formatting, indentation)

## Quality Standards:
- Fixed code must have valid syntax
- Preserve the original code style and formatting
- Don't add unnecessary changes
- Don't remove functionality
- Don't change variable/function names unless it's the issue being fixed
- Maintain the same indentation style (spaces/tabs)

## Fixing Priority:
1. Security issues (highest priority)
2. Error-level issues
3. Warning-level issues
4. Info-level issues

## Output Format:
Return ONLY a valid JSON object with this exact structure:

{
  "success": true,
  "fixedContent": "<<< THE ENTIRE FILE WITH ALL FIXES - EVERY LINE FROM START TO END >>>",
  "issues": [
    {
      "id": "issue-uuid-1",
      "file_path": "filename.py",
      "line_number": 42,
      "column_number": 10,
      "severity": "error",
      "category": "security",
      "rule_id": "SQL-INJECTION",
      "title": "SQL Injection Vulnerability",
      "description": "User input concatenated into SQL query",
      "suggestion": "Use parameterized queries",
      "code_snippet": "query = 'SELECT * FROM users WHERE id = ' + user_id",
      "suggested_fix": "query = 'SELECT * FROM users WHERE id = ?'",
      "fixDescription": "Replaced string concatenation with parameterized query using '?' placeholder and passed user_id as tuple to cursor.execute(query, (user_id,))",
      "wasFixed": true
    },
    {
      "id": "issue-uuid-2",
      "file_path": "filename.py",
      "line_number": 3,
      "severity": "error",
      "category": "security",
      "rule_id": "HARDCODED-SECRET",
      "title": "Hardcoded API Key",
      "description": "API key hardcoded in source",
      "fixDescription": "Replaced hardcoded API key with environment variable using os.environ.get('API_KEY') and added 'import os' at the top of the file",
      "wasFixed": true
    },
    {
      "id": "issue-uuid-3",
      "file_path": "filename.py",
      "line_number": 100,
      "severity": "error",
      "category": "architecture",
      "rule_id": "COMPLEX-FUNCTION",
      "title": "Function too complex",
      "description": "Cyclomatic complexity of 25",
      "fixDescription": "Could not automatically refactor - requires manual intervention to break down into smaller functions",
      "wasFixed": false
    }
  ]
}

⚠️ CRITICAL INSTRUCTIONS:

1. **fixedContent**: MUST contain the COMPLETE file (all lines from top to bottom)
   - Do NOT return partial content
   - Do NOT return only the changed sections
   - Return the ENTIRE file with fixes applied

2. **issues array**: Return the EXACT SAME array of issues you received, but add TWO new fields to each:
   - "fixDescription": A clear, detailed explanation of HOW you fixed this specific issue
     * If fixed: "Replaced X with Y to prevent Z" or "Added error handling using try/catch block"
     * If not fixed: "Could not automatically fix because [reason]"
   - "wasFixed": boolean - true if you successfully fixed it, false if you couldn't

3. **Preserve ALL original fields**: Keep id, file_path, line_number, column_number, severity, category, rule_id, title, description, suggestion, code_snippet, suggested_fix EXACTLY as they were in the input

4. **Same order**: Return issues in the SAME ORDER as you received them

## Examples of Good Fixes:

Example 1 - SQL Injection:
Before: query = "SELECT * FROM users WHERE id = " + user_id
After:  query = "SELECT * FROM users WHERE id = ?"
        cursor.execute(query, (user_id,))
Fix Description: "Replaced string concatenation with parameterized query using '?' placeholder and executed with tuple parameter"

Example 2 - Hardcoded Secret:
Before: API_KEY = "sk_live_12345"
After:  import os
        API_KEY = os.environ.get("API_KEY")
Fix Description: "Replaced hardcoded API key with environment variable using os.environ.get('API_KEY') and added 'import os' at top of file"

Example 3 - Missing Error Handling:
Before: const data = await fetch(url);
After:  try {
          const data = await fetch(url);
        } catch (error) {
          console.error('Fetch failed:', error);
          throw error;
        }
Fix Description: "Wrapped async fetch operation in try/catch block to handle potential network errors and log failures"

Return ONLY the JSON object, no additional text before or after.`;
  }

  private buildUserPrompt(request: AutoFixRequest): string {
    // Sort issues by severity and line number
    const sortedIssues = [...request.issues].sort((a, b) => {
      const severityOrder = { error: 1, warning: 2, info: 3 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return a.line_number - b.line_number;
    });

    return `Please fix ALL issues in this ${request.language} file and return the COMPLETE fixed file.

File: ${request.filePath}
Total Issues: ${request.issues.length}
Language: ${request.language}

## Issues to Fix (${request.issues.length} total):

${sortedIssues.map((issue, idx) => `
${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}
   Issue ID: ${issue.id}
   Location: Line ${issue.line_number}${issue.column_number ? `, Column ${issue.column_number}` : ''}
   Rule: ${issue.rule_id}
   Category: ${issue.category}
   Description: ${issue.description}
   ${issue.suggestion ? `Suggestion: ${issue.suggestion}` : ''}
   ${issue.code_snippet ? `Current Code Snippet:\n   ${issue.code_snippet}` : ''}
   ${issue.suggested_fix ? `Suggested Fix:\n   ${issue.suggested_fix}` : ''}
`).join('\n')}

## ENTIRE FILE CONTENT TO FIX:

\`\`\`${request.language}
${request.fileContent}
\`\`\`

## INSTRUCTIONS:
1. Fix ALL ${request.issues.length} issues listed above
2. Return the ENTIRE file with all fixes applied
3. For EACH issue, add "fixDescription" field explaining HOW you fixed it
4. Set "wasFixed" to true for fixed issues, false for issues you couldn't fix
5. Keep all original issue fields unchanged
6. Return issues in the same order as received
7. The output should be the complete file from the first line to the last line
8. Preserve all code that doesn't need fixing
9. Maintain the same formatting and indentation style

Begin fixing now. Return the JSON response with the complete fixed file and detailed fix descriptions for each issue.`;
  }

  async fixIssues(request: AutoFixRequest): Promise<AutoFixResponse> {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🔧 AUTO-FIX AGENT STARTING`);
    console.log(`${'='.repeat(70)}`);
    console.log(`📁 File: ${request.filePath}`);
    console.log(`📏 File size: ${request.fileContent.length} characters`);
    console.log(`📊 Issues to fix: ${request.issues.length}`);
    console.log(`🔤 Language: ${request.language}`);

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(request);

    console.log(`\n📤 Sending request to Ollama...`);
    console.log(`   Model: ${MODEL_NAME}`);
    console.log(`   URL: ${OLLAMA_API_URL}`);

    try {
      // Call Ollama API
      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: MODEL_NAME,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: false,
          format: 'json',
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as OllamaResponse;
      const content = data.message?.content || data.response || '';

      console.log(`\n✅ Received response from Ollama`);
      console.log(`📦 Response size: ${content.length} characters`);

      // Parse JSON response
      let result: AutoFixResponse;
      try {
        result = JSON.parse(content);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON response:', parseError);
        console.log('Raw response:', content.substring(0, 500));
        throw new Error('Invalid JSON response from LLM');
      }

      // Validate that fixedContent is not empty
      if (!result.fixedContent || result.fixedContent.trim().length === 0) {
        throw new Error('LLM returned empty fixedContent');
      }

      // Validate that issues array exists
      if (!result.issues || result.issues.length === 0) {
        throw new Error('LLM returned empty issues array');
      }

      const fixedCount = result.issues.filter(i => i.wasFixed).length;
      const unfixedCount = result.issues.filter(i => !i.wasFixed).length;

      console.log(`\n${'='.repeat(70)}`);
      console.log(`✅ AUTO-FIX COMPLETED SUCCESSFULLY`);
      console.log(`${'='.repeat(70)}`);
      console.log(`✅ Fixed issues: ${fixedCount}`);
      console.log(`⚠️  Unfixed issues: ${unfixedCount}`);
      console.log(`📏 Fixed content size: ${result.fixedContent.length} characters`);

      console.log(`\n📋 ISSUE RESOLUTION DETAILS:`);
      console.log('─'.repeat(70));

      result.issues.forEach((issue, idx) => {
        const status = issue.wasFixed ? '✅ FIXED' : '❌ NOT FIXED';
        console.log(`\n${idx + 1}. [${status}] ${issue.title}`);
        console.log(`   Issue ID: ${issue.id}`);
        console.log(`   Location: ${issue.file_path}:${issue.line_number}`);
        console.log(`   Severity: ${issue.severity} | Category: ${issue.category}`);
        console.log(`   💡 Fix Description: ${issue.fixDescription}`);
      });

      return result;

    } catch (error) {
      console.error('\n❌ AUTO-FIX FAILED');
      console.error('Error:', error);
      throw error;
    }
  }
}

// ============================================================================
// TEST DATA
// ============================================================================

// Test 1: Python file with 3 issues
const TEST_PYTHON_FILE = `import sqlite3

API_KEY = "sk_live_12345"

def get_user(user_id):
    query = "SELECT * FROM users WHERE id = " + user_id
    conn = sqlite3.connect("db.sqlite")
    cursor = conn.cursor()
    cursor.execute(query)
    return cursor.fetchone()

unused_variable = 42
`;

const TEST_PYTHON_ISSUES: CodeIssue[] = [
  {
    id: 'issue-python-1',
    file_path: 'user_service.py',
    line_number: 3,
    severity: 'error',
    category: 'security',
    rule_id: 'HARDCODED-SECRET',
    title: 'Hardcoded API Key',
    description: 'API key is hardcoded in source code. This is a security vulnerability.',
    suggestion: 'Use environment variables to store API keys',
    code_snippet: 'API_KEY = "sk_live_12345"',
    suggested_fix: 'import os\nAPI_KEY = os.environ.get("API_KEY")',
  },
  {
    id: 'issue-python-2',
    file_path: 'user_service.py',
    line_number: 6,
    severity: 'error',
    category: 'security',
    rule_id: 'SQL-INJECTION',
    title: 'SQL Injection Vulnerability',
    description: 'User input is concatenated directly into SQL query without sanitization',
    suggestion: 'Use parameterized queries with placeholders',
    code_snippet: 'query = "SELECT * FROM users WHERE id = " + user_id',
    suggested_fix: 'query = "SELECT * FROM users WHERE id = ?"\ncursor.execute(query, (user_id,))',
  },
  {
    id: 'issue-python-3',
    file_path: 'user_service.py',
    line_number: 12,
    severity: 'warning',
    category: 'linting',
    rule_id: 'UNUSED-VARIABLE',
    title: 'Unused Variable',
    description: 'Variable "unused_variable" is defined but never used',
    suggestion: 'Remove unused variable',
    code_snippet: 'unused_variable = 42',
  },
];

// Test 2: TypeScript file with 5 issues
const TEST_TYPESCRIPT_FILE = `var endpoint = "https://api.example.com";

const users = []

async function fetchData(url) {
  const response = await fetch(url);
  return response.json()
}

function displayUserInput(input: string) {
  document.getElementById('output').innerHTML = input;
}
`;

const TEST_TYPESCRIPT_ISSUES: CodeIssue[] = [
  {
    id: 'issue-ts-1',
    file_path: 'api-handler.ts',
    line_number: 1,
    severity: 'warning',
    category: 'linting',
    rule_id: 'NO-VAR',
    title: 'Use const/let instead of var',
    description: 'Variable declared with "var" should use "const" or "let"',
    suggestion: 'Replace "var" with "const"',
    code_snippet: 'var endpoint = "https://api.example.com";',
    suggested_fix: 'const endpoint = "https://api.example.com";',
  },
  {
    id: 'issue-ts-2',
    file_path: 'api-handler.ts',
    line_number: 3,
    severity: 'warning',
    category: 'linting',
    rule_id: 'MISSING-SEMICOLON',
    title: 'Missing semicolon',
    description: 'Statement should end with a semicolon',
    suggestion: 'Add semicolon at end of statement',
    code_snippet: 'const users = []',
    suggested_fix: 'const users = [];',
  },
  {
    id: 'issue-ts-3',
    file_path: 'api-handler.ts',
    line_number: 5,
    severity: 'error',
    category: 'testing',
    rule_id: 'NO-ERROR-HANDLING',
    title: 'Missing error handling',
    description: 'Async function does not have try/catch block for error handling',
    suggestion: 'Wrap async operations in try/catch',
    suggested_fix: 'try {\n  const response = await fetch(url);\n  return response.json();\n} catch (error) {\n  console.error("Fetch failed:", error);\n  throw error;\n}',
  },
  {
    id: 'issue-ts-4',
    file_path: 'api-handler.ts',
    line_number: 7,
    severity: 'warning',
    category: 'linting',
    rule_id: 'MISSING-SEMICOLON',
    title: 'Missing semicolon',
    description: 'Statement should end with a semicolon',
    suggestion: 'Add semicolon at end of statement',
    code_snippet: 'return response.json()',
    suggested_fix: 'return response.json();',
  },
  {
    id: 'issue-ts-5',
    file_path: 'api-handler.ts',
    line_number: 11,
    severity: 'error',
    category: 'security',
    rule_id: 'XSS-VULNERABILITY',
    title: 'XSS Vulnerability',
    description: 'Using innerHTML with user input can lead to XSS attacks',
    suggestion: 'Use textContent instead of innerHTML for user input',
    code_snippet: 'document.getElementById(\'output\').innerHTML = input;',
    suggested_fix: 'const el = document.getElementById(\'output\');\nif (el) el.textContent = input;',
  },
];

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runTests() {
  const agent = new AutoFixAgent();

  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║         AUTO-FIX AGENT - PRODUCTION TEST SUITE                    ║');
  console.log('║         (With Fix Descriptions for Each Issue)                    ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');

  // Test 1: Python file with 3 issues
  console.log('\n📝 TEST 1: Python File - Fix 3 Issues (SQL Injection, Hardcoded Key, Unused Var)');
  console.log('─'.repeat(70));

  try {
    const pythonRequest: AutoFixRequest = {
      filePath: 'user_service.py',
      fileContent: TEST_PYTHON_FILE,
      language: 'python',
      issues: TEST_PYTHON_ISSUES,
      projectId: 1,
      userId: 1,
    };

    const pythonResult = await agent.fixIssues(pythonRequest);

    console.log('\n📄 FIXED PYTHON FILE:');
    console.log('─'.repeat(70));
    console.log(pythonResult.fixedContent);
    console.log('─'.repeat(70));

    // Validate
    const validations = {
      'Has content': pythonResult.fixedContent.length > 0,
      'Fixed all issues': pythonResult.issues.filter(i => i.wasFixed).length === 3,
      'Has fix descriptions': pythonResult.issues.every(i => i.fixDescription && i.fixDescription.length > 0),
      'Contains import os': pythonResult.fixedContent.includes('import os'),
      'Uses env variable': pythonResult.fixedContent.includes('os.environ'),
      'Uses parameterized query': pythonResult.fixedContent.includes('?'),
      'No hardcoded key': !pythonResult.fixedContent.includes('sk_live_12345'),
      'No unused variable': !pythonResult.fixedContent.includes('unused_variable = 42'),
      'Issues array matches input length': pythonResult.issues.length === TEST_PYTHON_ISSUES.length,
      'All issue IDs preserved': pythonResult.issues.every((issue, idx) => issue.id === TEST_PYTHON_ISSUES[idx].id),
    };

    console.log('\n✅ PYTHON TEST VALIDATION:');
    Object.entries(validations).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });

  } catch (error) {
    console.error('❌ Python test failed:', error);
  }

  console.log('\n\n');

  // Test 2: TypeScript file with 5 issues
  console.log('\n📝 TEST 2: TypeScript File - Fix 5 Issues (var, semicolons, error handling, XSS)');
  console.log('─'.repeat(70));

  try {
    const tsRequest: AutoFixRequest = {
      filePath: 'api-handler.ts',
      fileContent: TEST_TYPESCRIPT_FILE,
      language: 'typescript',
      issues: TEST_TYPESCRIPT_ISSUES,
      projectId: 1,
      userId: 1,
    };

    const tsResult = await agent.fixIssues(tsRequest);

    console.log('\n📄 FIXED TYPESCRIPT FILE:');
    console.log('─'.repeat(70));
    console.log(tsResult.fixedContent);
    console.log('─'.repeat(70));

    // Validate
    const validations = {
      'Has content': tsResult.fixedContent.length > 0,
      'Fixed all issues': tsResult.issues.filter(i => i.wasFixed).length === 5,
      'Has fix descriptions': tsResult.issues.every(i => i.fixDescription && i.fixDescription.length > 0),
      'Uses const instead of var': tsResult.fixedContent.includes('const endpoint') && !tsResult.fixedContent.includes('var endpoint'),
      'Has semicolons': (tsResult.fixedContent.match(/;/g) || []).length >= 3,
      'Has try/catch': tsResult.fixedContent.includes('try') && tsResult.fixedContent.includes('catch'),
      'Uses textContent': tsResult.fixedContent.includes('textContent'),
      'No innerHTML with input': !tsResult.fixedContent.includes('innerHTML = input'),
      'Issues array matches input length': tsResult.issues.length === TEST_TYPESCRIPT_ISSUES.length,
      'All issue IDs preserved': tsResult.issues.every((issue, idx) => issue.id === TEST_TYPESCRIPT_ISSUES[idx].id),
    };

    console.log('\n✅ TYPESCRIPT TEST VALIDATION:');
    Object.entries(validations).forEach(([check, passed]) => {
      console.log(`   ${passed ? '✅' : '❌'} ${check}`);
    });

  } catch (error) {
    console.error('❌ TypeScript test failed:', error);
  }

  console.log('\n\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║                  TESTS COMPLETED                                  ║');
  console.log('╚════════════════════════════════════════════════════════════════════╝\n');
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

// Export for use in backend
export { AutoFixAgent };
export type { AutoFixRequest, AutoFixResponse, CodeIssue, CodeIssueWithFix };
