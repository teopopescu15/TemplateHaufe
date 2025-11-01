/**
 * Production-Ready Code Review Agent
 * Uses Ollama API with comprehensive coding guidelines and multi-dimensional analysis
 */

const OLLAMA_API_URL = 'http://localhost:11434/api/chat';
const MODEL_NAME = 'gpt-oss:120b-cloud';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface CodeReviewRequest {
  code: string;
  language: string;
  fileName: string;
  enabledGuidelines: string[];
  enabledDimensions: string[];
  customRules?: string;
}

interface CodeIssue {
  id: string;
  file: string;
  line: number;
  column: number;
  endLine: number;
  endColumn: number;
  severity: 'error' | 'warning' | 'info';
  category: 'security' | 'architecture' | 'linting' | 'testing' | 'performance';
  rule: string;
  title: string;
  description: string;
  suggestion: string;
  codeSnippet: string;
  suggestedFix?: string;
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
// CODING GUIDELINES DATABASE
// Based on PEP8, Google Style Guide, Airbnb/ESLint, OWASP
// ============================================================================

const CODING_GUIDELINES = {
  pep8: `
## PEP 8 - Python Style Guide (Official Python.org)

### Naming Conventions:
- **Functions, variables, methods**: Use lowercase with underscores (snake_case)
  ❌ Bad: myFunction, MyVariable
  ✅ Good: my_function, my_variable

- **Classes**: Use CapitalizedWords (PascalCase)
  ❌ Bad: my_class, myClass
  ✅ Good: MyClass

- **Constants**: Use uppercase with underscores
  ❌ Bad: max_value
  ✅ Good: MAX_VALUE

- **Private attributes**: Prefix with single underscore
  ✅ Good: _internal_value

### Line Length & Formatting:
- Maximum line length: **79 characters** for code
- Maximum line length: **72 characters** for comments/docstrings
- Use 4 spaces per indentation level (NO tabs)

### Spacing Around Operators:
- Use single space around assignment operators: x = 1
- Use single space around comparison operators: if x == 5:
- No space before colon in slices: x[1:5]
- No space around = in keyword arguments: func(arg=value)

### Import Ordering:
1. Standard library imports
2. Related third-party imports
3. Local application/library imports
- Each group separated by blank line
- Imports should be on separate lines

### Docstring Format:
- Use triple double quotes: """Docstring"""
- One-line docstrings: """Do something."""
- Multi-line: Summary line, blank line, detailed description
`,

  googleStyle: `
## Google Style Guide (JavaScript & Python)

### Function Documentation:
- **Python**: Use Google-style docstrings with Args, Returns, Raises sections
  """
  Summary line.

  Args:
      param1 (int): Description of param1.
      param2 (str): Description of param2.

  Returns:
      bool: Description of return value.

  Raises:
      ValueError: If param1 is negative.
  """

- **JavaScript**: Use JSDoc comments with @param and @return
  /**
   * Description of function.
   * @param {number} x - Description of x.
   * @param {string} y - Description of y.
   * @return {boolean} Description of return value.
   */

### Indentation:
- **Python**: 4 spaces per indentation level (consistent with PEP8)
- **JavaScript**: 2 spaces per indentation level
- Never mix tabs and spaces

### Import/Module Organization:
- Group related imports together
- Avoid wildcard imports (from module import *)
- Use absolute imports over relative imports

### Commenting Conventions:
- Write comments for complex logic, not obvious code
- Use complete sentences with proper capitalization
- Update comments when code changes
`,

  eslint: `
## ESLint / Airbnb JavaScript/TypeScript Style Guide

### Semicolons:
- **Always use semicolons** to terminate statements
  ❌ Bad: const x = 5
  ✅ Good: const x = 5;

### Arrow Functions:
- Use arrow functions for anonymous functions
  ❌ Bad: [1, 2, 3].map(function(x) { return x * 2; });
  ✅ Good: [1, 2, 3].map((x) => x * 2);

- Omit parentheses for single parameter (unless TypeScript needs types)
  ✅ Good: x => x * 2
  ✅ Also Good (TypeScript): (x: number) => x * 2

### Variable Declaration:
- Use **const** by default for variables that won't be reassigned
- Use **let** for variables that will be reassigned
- **Never use var**
  ❌ Bad: var count = 0;
  ✅ Good: const MAX = 100;
  ✅ Good: let count = 0;

### Async/Await Patterns:
- Prefer async/await over raw promises for readability
  ❌ Bad:
    fetch(url).then(res => res.json()).then(data => console.log(data));
  ✅ Good:
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);

- Always use try/catch with async/await
  ✅ Good:
    try {
      const data = await fetchData();
    } catch (error) {
      console.error('Failed to fetch:', error);
    }

### Object/Array Destructuring:
- Use destructuring for accessing multiple properties
  ❌ Bad:
    const firstName = user.firstName;
    const lastName = user.lastName;
  ✅ Good:
    const { firstName, lastName } = user;

### Template Literals:
- Use template literals instead of string concatenation
  ❌ Bad: const msg = 'Hello ' + name + '!';
  ✅ Good: const msg = \`Hello \${name}!\`;
`,
};

// ============================================================================
// ANALYSIS DIMENSIONS DATABASE
// Based on OWASP, Clean Code, SOLID principles
// ============================================================================

const ANALYSIS_DIMENSIONS = {
  linting: `
## Linting & Code Style

Check for:
- **Naming conventions**: Inconsistent naming (camelCase vs snake_case mixing)
- **Unused variables/imports**: Variables declared but never used
- **Code formatting**: Inconsistent indentation, missing semicolons (JS/TS)
- **Dead code**: Unreachable code after return/break statements
- **Console statements**: console.log() left in production code
- **Debugger statements**: debugger; statements in code
`,

  security: `
## Security Vulnerabilities (OWASP Top 10 2024)

### SQL Injection:
- ❌ CRITICAL: String concatenation in SQL queries
  Bad: query = "SELECT * FROM users WHERE id = " + userId;
- ✅ Use parameterized queries or ORMs
  Good: query = "SELECT * FROM users WHERE id = ?", [userId]

### Cross-Site Scripting (XSS):
- ❌ CRITICAL: Unescaped user input in HTML
  Bad: innerHTML = userInput;
- ✅ Sanitize and escape all user input
  Good: textContent = sanitize(userInput);

### Hardcoded Secrets:
- ❌ CRITICAL: API keys, passwords, tokens in source code
  Bad: const API_KEY = "sk_live_abc123xyz";
- ✅ Use environment variables
  Good: const API_KEY = process.env.API_KEY;

### Authentication & Authorization:
- Missing authentication checks on sensitive endpoints
- Weak password requirements
- No rate limiting on login endpoints
- Missing CSRF tokens on state-changing operations

### Insecure File Operations:
- ❌ Path traversal vulnerabilities: Using user input in file paths
- ❌ Arbitrary file uploads without validation
- ✅ Validate file types, sizes, and sanitize file names

### Command Injection:
- ❌ CRITICAL: User input in system commands
  Bad: exec("ls " + userInput);
- ✅ Use safe APIs or validate input strictly
  Good: execFile("ls", [sanitizedInput]);
`,

  architecture: `
## Architecture & Clean Code Principles

### DRY (Don't Repeat Yourself):
- ❌ Duplicated code blocks (3+ similar code segments)
- ✅ Extract repeated logic into reusable functions

### Function Complexity:
- ❌ Functions longer than 50 lines (too complex)
- ❌ Deeply nested logic (4+ levels of nesting)
- ❌ High cyclomatic complexity (10+ decision points)
- ✅ Break down into smaller, focused functions
- ✅ Single Responsibility Principle - one function, one purpose

### SOLID Principles:

**S - Single Responsibility:**
- Each class/function should have ONE reason to change
- ❌ Bad: UserManager that handles users AND sends emails
- ✅ Good: Separate UserService and EmailService

**O - Open/Closed:**
- Open for extension, closed for modification
- ✅ Use interfaces/abstract classes for extensibility

**L - Liskov Substitution:**
- Subtypes must be substitutable for base types
- ❌ Bad: Square extends Rectangle but breaks behavior

**I - Interface Segregation:**
- Many specific interfaces better than one general interface
- ❌ Bad: IWorker with work(), eat(), sleep() for robots

**D - Dependency Inversion:**
- Depend on abstractions, not concrete implementations
- ✅ Use dependency injection

### Code Smells:
- **God Objects/Classes**: Classes doing too much (500+ lines)
- **Tight Coupling**: Classes heavily dependent on each other
- **Circular Dependencies**: Module A imports B, B imports A
- **Magic Numbers**: Unexplained numeric constants
  ❌ Bad: if (status == 3)
  ✅ Good: if (status == STATUS_COMPLETED)
`,

  testing: `
## Testing & Quality Assurance

### Missing Test Coverage:
- Critical business logic without unit tests
- API endpoints without integration tests
- Edge cases not tested (null, empty, boundary values)

### Test Quality Issues:
- Tests that don't actually assert anything
- Tests with multiple unrelated assertions
- Tests dependent on external services (not mocked)
- Tests that rely on execution order

### Error Handling:
- ❌ Missing try/catch blocks for async operations
- ❌ Silent failures (empty catch blocks)
- ❌ Not validating function inputs
- ✅ Proper error handling with meaningful messages

### Integration Tests:
- Missing tests for API contract compliance
- No tests for database transactions
- Missing authentication/authorization tests
`,

  performance: `
## Performance & Optimization

### Inefficient Algorithms:
- ❌ O(n²) nested loops where O(n) possible
  Bad: Nested loops for searching (use hash maps instead)
- ❌ Unnecessary array iterations
  Bad: .filter().map() (use single .reduce())

### Memory Issues:
- Memory leaks from event listeners not removed
- Large data loaded into memory unnecessarily
- Missing pagination for large datasets

### React/Frontend Performance:
- ❌ Missing React.memo for expensive components
- ❌ Unnecessary re-renders (use useMemo, useCallback)
- ❌ Large bundle sizes (missing code splitting)
- ❌ Not lazy-loading images

### Database Performance:
- ❌ N+1 query problems (query in loop)
- ❌ Missing database indexes on queried fields
- ❌ Loading entire table instead of specific columns
- ✅ Use SELECT specific columns, not SELECT *

### Blocking Operations:
- Synchronous operations in async contexts
- Blocking the main thread with heavy computation
- Missing worker threads for CPU-intensive tasks
`,
};

// ============================================================================
// SYSTEM PROMPT BUILDER
// ============================================================================

class CodeReviewPromptBuilder {
  private baseInstructions = `You are an expert code reviewer with deep knowledge of software engineering best practices, security vulnerabilities, and clean code principles.

Your task is to perform a comprehensive code review and identify issues across multiple dimensions.

## Your Responsibilities:
1. Analyze code against established coding guidelines
2. Identify security vulnerabilities
3. Detect architectural problems and code smells
4. Flag performance issues
5. Check for missing or poor test coverage
6. Ensure code maintainability and readability

## Analysis Approach:
- Be specific: Point to exact lines and provide concrete examples
- Be actionable: Suggest how to fix each issue
- Be thorough: Check all dimensions enabled by the user
- Be practical: Focus on issues that matter, not pedantic style nitpicks
- Prioritize: Security issues are most critical, then architecture, then style

## Important:
- Return issues in order of importance: errors > warnings > info
- Provide code snippets showing the problem
- Include suggested fixes where applicable
- Reference official documentation when relevant
`;

  private outputFormat = `
## Output Format:
You MUST return a valid JSON object with this exact structure:

{
  "issues": [
    {
      "id": "unique-id-001",
      "file": "filename.py",
      "line": 42,
      "column": 10,
      "endLine": 45,
      "endColumn": 20,
      "severity": "error",
      "category": "security",
      "rule": "SQL-INJECTION",
      "title": "SQL Injection Vulnerability",
      "description": "User input is directly concatenated into SQL query without sanitization, allowing attackers to execute arbitrary SQL commands.",
      "suggestion": "Use parameterized queries with placeholders instead of string concatenation. Example: cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))",
      "codeSnippet": "query = 'SELECT * FROM users WHERE id = ' + user_id",
      "suggestedFix": "query = 'SELECT * FROM users WHERE id = ?'\\ncursor.execute(query, (user_id,))"
    }
  ]
}

### Severity Levels:
- **error**: Security vulnerabilities, bugs that will cause failures, critical violations
- **warning**: Code smells, performance issues, maintainability problems
- **info**: Style guide violations, minor improvements, documentation gaps

### Categories:
- **security**: Vulnerabilities, injection risks, exposed secrets
- **architecture**: SOLID violations, code smells, complexity issues
- **linting**: Style guide violations, formatting, naming conventions
- **testing**: Missing tests, poor test quality, error handling gaps
- **performance**: Inefficient algorithms, memory leaks, N+1 queries

Return ONLY the JSON object, no additional text.
`;

  buildSystemPrompt(request: CodeReviewRequest): string {
    let prompt = this.baseInstructions;

    // Add language-specific context
    prompt += `\n\n## Language Context:\nYou are reviewing ${request.language} code from file: ${request.fileName}\n`;

    // Add enabled coding guidelines
    if (request.enabledGuidelines.length > 0) {
      prompt += '\n## Coding Guidelines to Check:\n';
      request.enabledGuidelines.forEach((guideline) => {
        if (CODING_GUIDELINES[guideline as keyof typeof CODING_GUIDELINES]) {
          prompt += CODING_GUIDELINES[guideline as keyof typeof CODING_GUIDELINES];
        }
      });
    }

    // Add enabled analysis dimensions
    if (request.enabledDimensions.length > 0) {
      prompt += '\n## Analysis Dimensions:\n';
      request.enabledDimensions.forEach((dimension) => {
        if (ANALYSIS_DIMENSIONS[dimension as keyof typeof ANALYSIS_DIMENSIONS]) {
          prompt += ANALYSIS_DIMENSIONS[dimension as keyof typeof ANALYSIS_DIMENSIONS];
        }
      });
    }

    // Add custom rules if provided
    if (request.customRules) {
      prompt += `\n\n## Custom Project Rules:\n${request.customRules}\n`;
    }

    // Add output format
    prompt += this.outputFormat;

    return prompt;
  }

  buildUserPrompt(request: CodeReviewRequest): string {
    return `Please perform a comprehensive code review of the following ${request.language} code.

File: ${request.fileName}

Code:
\`\`\`${request.language}
${request.code}
\`\`\`

Analyze the code according to the guidelines and dimensions specified in the system prompt.
Return a JSON object with all identified issues, ordered by severity and category importance.
`;
  }
}

// ============================================================================
// CODE REVIEW AGENT
// ============================================================================

class CodeReviewAgent {
  private promptBuilder: CodeReviewPromptBuilder;

  constructor() {
    this.promptBuilder = new CodeReviewPromptBuilder();
  }

  async reviewCode(request: CodeReviewRequest): Promise<CodeIssue[]> {
    const systemPrompt = this.promptBuilder.buildSystemPrompt(request);
    const userPrompt = this.promptBuilder.buildUserPrompt(request);

    console.log('🔍 Starting code review...\n');
    console.log('📋 Enabled Guidelines:', request.enabledGuidelines.join(', '));
    console.log('🎯 Analysis Dimensions:', request.enabledDimensions.join(', '));
    console.log('\n🤖 Sending request to Ollama...\n');

    try {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json() as OllamaResponse;
      const content = data.message?.content || data.response || '';

      console.log('✅ Received response from Ollama\n');
      console.log('📄 Raw Response:\n', content, '\n');

      // Parse JSON response
      const result = JSON.parse(content);
      return result.issues || [];
    } catch (error) {
      console.error('❌ Error during code review:', error);
      throw error;
    }
  }
}

// ============================================================================
// MOCK TEST DATA
// ============================================================================

const MOCK_PYTHON_CODE = `
import os
import sqlite3

# Bad: Hardcoded credentials
API_KEY = "sk_live_1234567890abcdef"
DATABASE_PASSWORD = "admin123"

def get_user(user_id):
    # Bad: SQL Injection vulnerability
    query = "SELECT * FROM users WHERE id = " + user_id
    conn = sqlite3.connect("database.db")
    cursor = conn.cursor()
    cursor.execute(query)
    return cursor.fetchone()

def ProcessUserData(UserName, user_email):
    # Bad: Inconsistent naming (mixing styles)
    # Bad: Function too long and complex
    if UserName:
        if len(UserName) > 0:
            if user_email:
                if "@" in user_email:
                    user_data = get_user(UserName)
                    if user_data:
                        result = []
                        for item in user_data:
                            if item:
                                result.append(item.upper())
                        return result
    return None

# Bad: Unused variable
unused_var = 42

# Bad: Missing docstring
class userManager:
    def __init__(self):
        self.users = []

    def add_user(self, user):
        self.users.append(user)
`;

const MOCK_JAVASCRIPT_CODE = `
// Bad: Using var instead of const/let
var apiEndpoint = "https://api.example.com";

// Bad: Missing semicolons
const users = []

// Bad: Not using arrow functions
users.map(function(user) {
  return user.name
})

// Bad: XSS vulnerability
function displayUserInput(input) {
  document.getElementById('output').innerHTML = input;
}

// Bad: No error handling
async function fetchData(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Bad: N+1 query problem
async function getUsersWithPosts() {
  const users = await db.query("SELECT * FROM users");
  for (let user of users) {
    user.posts = await db.query("SELECT * FROM posts WHERE user_id = " + user.id);
  }
  return users;
}

// Bad: Duplicated code (DRY violation)
function validateEmail(email) {
  if (!email) return false;
  if (!email.includes("@")) return false;
  if (email.length < 5) return false;
  return true;
}

function validateUsername(username) {
  if (!username) return false;
  if (username.length < 5) return false;
  if (username.length > 20) return false;
  return true;
}
`;

// ============================================================================
// TEST RUNNER
// ============================================================================

async function runTests() {
  const agent = new CodeReviewAgent();

  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║     Code Review Agent - Production Test Suite        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Test 1: Python code with all dimensions
  console.log('📝 TEST 1: Python Code Review (All Dimensions)\n');
  console.log('=' .repeat(60));

  const pythonRequest: CodeReviewRequest = {
    code: MOCK_PYTHON_CODE,
    language: 'python',
    fileName: 'user_service.py',
    enabledGuidelines: ['pep8', 'googleStyle'],
    enabledDimensions: ['security', 'linting', 'architecture'],
  };

  try {
    const pythonIssues = await agent.reviewCode(pythonRequest);
    console.log(`\n✅ Found ${pythonIssues.length} issues in Python code:\n`);
    pythonIssues.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
      console.log(`   📍 Line ${issue.line}: ${issue.rule}`);
      console.log(`   📝 ${issue.description}`);
      console.log(`   💡 ${issue.suggestion}\n`);
    });
  } catch (error) {
    console.error('❌ Python test failed:', error);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: JavaScript code with custom rules
  console.log('📝 TEST 2: JavaScript Code Review (With Custom Rules)\n');
  console.log('=' .repeat(60));

  const jsRequest: CodeReviewRequest = {
    code: MOCK_JAVASCRIPT_CODE,
    language: 'javascript',
    fileName: 'user-api.js',
    enabledGuidelines: ['eslint'],
    enabledDimensions: ['security', 'performance', 'linting'],
    customRules: `
      Additional Project Rules:
      - All async functions must have try/catch blocks
      - No console.log statements in production code
      - Maximum function length: 30 lines
      - All functions must have JSDoc comments
    `,
  };

  try {
    const jsIssues = await agent.reviewCode(jsRequest);
    console.log(`\n✅ Found ${jsIssues.length} issues in JavaScript code:\n`);
    jsIssues.forEach((issue, idx) => {
      console.log(`${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.title}`);
      console.log(`   📍 Line ${issue.line}: ${issue.rule}`);
      console.log(`   📝 ${issue.description}`);
      console.log(`   💡 ${issue.suggestion}\n`);
    });
  } catch (error) {
    console.error('❌ JavaScript test failed:', error);
  }

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║              Tests Completed Successfully!            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
}

// ============================================================================
// MAIN ENTRY POINT
// ============================================================================

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

// Export for use in other modules
export { CodeReviewAgent, CodeReviewPromptBuilder, CODING_GUIDELINES, ANALYSIS_DIMENSIONS };
export type { CodeReviewRequest, CodeIssue };
