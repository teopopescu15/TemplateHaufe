/**
 * Ollama Service - AI-Powered Code Review Integration
 * Communicates with local Ollama instance for code analysis
 */

import {
  OllamaReviewRequest,
  OllamaReviewResponse,
  ReviewConfig,
  CodeIssue,
} from '../types/codeReview';

// ============================================================================
// CONFIGURATION
// ============================================================================

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434/api/chat';
const DEFAULT_MODEL = 'gpt-oss:120b-cloud';

// ============================================================================
// CODING GUIDELINES DATABASE
// Based on PEP8, Google Style Guide, Airbnb/ESLint, OWASP
// ============================================================================

export const CODING_GUIDELINES: Record<string, string> = {
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

export const ANALYSIS_DIMENSIONS: Record<string, string> = {
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

  documentation: `
## Documentation Quality & Completeness

### Missing Function/Class Documentation:
- ❌ Public functions without JSDoc (JavaScript/TypeScript)
  Bad: function getUserById(id) { ... } // No JSDoc
  ✅ Good:
    /**
     * Retrieves a user by their unique identifier
     * @param {number} id - User ID
     * @returns {Promise<User>} User object
     * @throws {NotFoundError} If user doesn't exist
     */
    function getUserById(id) { ... }

- ❌ Python functions without docstrings
  Bad: def calculate_total(items): ...
  ✅ Good:
    def calculate_total(items):
        """
        Calculate total price of items.

        Args:
            items (list): List of item dictionaries with 'price' key.

        Returns:
            float: Total price rounded to 2 decimal places.
        """

### Outdated or Misleading Documentation:
- ❌ Comments that contradict the actual code
  Bad: // Returns user name
        return user.email; // Actually returns email!
- ❌ Docstring parameters that don't match function signature
  Bad: @param {string} username // But function takes 'email' parameter
- ❌ README examples using deprecated APIs

### Complex Code Without Comments:
- ❌ Complex algorithms without explanatory comments
- ❌ Business logic without rationale
- ❌ Magic numbers without explanation
  Bad: if (score > 0.73) // Why 0.73?
  ✅ Good: if (score > CONFIDENCE_THRESHOLD) // 0.73 = 95th percentile

### Missing Project Documentation:
- ❌ New features added without README updates
- ❌ New API endpoints without API documentation
- ❌ Configuration options without documentation
- ❌ Environment variables without .env.example entry

### Check These Patterns:
1. **Exported functions/classes**: MUST have JSDoc/docstrings
2. **API endpoints**: Should have description, parameters, response format
3. **Complex algorithms**: Need explanatory comments
4. **Public interfaces**: Require complete documentation
5. **Configuration**: Document all options and defaults
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

## Documentation Quality Requirements:

**For EVERY issue you report, you MUST provide:**

### 1. Description Field (4-6 sentences):
- **WHAT**: Clearly state what the problem is (1 sentence)
- **WHY IT MATTERS**: Explain the consequences/risks of this issue (2-3 sentences)
  - For security: What attack vectors does it enable?
  - For architecture: How does it impact maintainability/scalability?
  - For performance: What is the performance impact?
  - For testing: What risks exist without tests?
  - For documentation: What confusion or maintenance issues result?
- **CONTEXT**: Provide relevant background or best practices (1-2 sentences)

**Example GOOD description:**
"User input is directly concatenated into SQL query without sanitization. This creates a SQL injection vulnerability where attackers can execute arbitrary SQL commands by crafting malicious input. For example, inputting '; DROP TABLE users; --' could delete the entire users table. According to OWASP Top 10 2024, SQL injection remains the #1 web application vulnerability. This issue could lead to complete database compromise, data theft, or data destruction."

**Example BAD description (too brief):**
"SQL injection risk detected."

### 2. Suggestion Field (3-5 sentences):
- **HOW TO FIX**: Step-by-step guidance (2-3 sentences)
- **WHY THIS FIX WORKS**: Explain the mechanism (1-2 sentences)
- **ADDITIONAL RECOMMENDATIONS**: Best practices or alternatives (1 sentence if applicable)

**Example GOOD suggestion:**
"Replace string concatenation with parameterized queries using placeholders (? or $1). Parameterized queries separate SQL code from data, treating user input as data rather than executable code. Most database libraries (pg, mysql2, sqlite3) support parameterized queries natively. Additionally, consider using an ORM like TypeORM or Sequelize which handles parameterization automatically and provides additional security layers."

**Example BAD suggestion (too brief):**
"Use parameterized queries."

### 3. Educational Value:
- Reference official documentation when possible
- Cite industry standards (OWASP, PEP8, Google Style Guide, MDN)
- Explain the underlying principle, not just the fix
- Help developers understand WHY, not just WHAT
`;

  private outputFormat = `
## Output Format:
You MUST return a valid JSON object with this exact structure:

{
  "issues": [
    {
      "line_number": 42,
      "column_number": 10,
      "end_line_number": 45,
      "end_column_number": 20,
      "severity": "error",
      "category": "security",
      "rule_id": "SQL-INJECTION",
      "title": "SQL Injection Vulnerability",
      "description": "User input is directly concatenated into SQL query without sanitization, allowing attackers to execute arbitrary SQL commands.",
      "suggestion": "Use parameterized queries with placeholders instead of string concatenation.",
      "code_snippet": "query = 'SELECT * FROM users WHERE id = ' + user_id",
      "suggested_fix": "query = 'SELECT * FROM users WHERE id = ?'\\ncursor.execute(query, (user_id,))"
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
- **documentation**: Missing/outdated docs, undocumented functions, missing comments

Return ONLY the JSON object, no additional text.
`;

  buildSystemPrompt(
    filePath: string,
    config: ReviewConfig,
    existingIssues: CodeIssue[]
  ): string {
    let prompt = this.baseInstructions;

    // Add file context
    const fileExtension = filePath.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      ts: 'TypeScript',
      tsx: 'TypeScript React',
      js: 'JavaScript',
      jsx: 'JavaScript React',
      py: 'Python',
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      go: 'Go',
      rs: 'Rust',
      rb: 'Ruby',
      php: 'PHP',
    };
    const language = languageMap[fileExtension || ''] || 'Unknown';

    prompt += `\n\n## Language Context:\nYou are reviewing ${language} code from file: ${filePath}\n`;

    // Add enabled coding guidelines
    if (config.enabledGuidelines && config.enabledGuidelines.length > 0) {
      prompt += '\n## Coding Guidelines to Check:\n';
      config.enabledGuidelines.forEach((guideline) => {
        if (CODING_GUIDELINES[guideline]) {
          prompt += CODING_GUIDELINES[guideline];
        }
      });
    }

    // Add enabled analysis dimensions
    if (config.enabledDimensions && config.enabledDimensions.length > 0) {
      prompt += '\n## Analysis Dimensions:\n';
      config.enabledDimensions.forEach((dimension) => {
        if (ANALYSIS_DIMENSIONS[dimension]) {
          prompt += ANALYSIS_DIMENSIONS[dimension];
        }
      });
    }

    // Add custom instructions if provided
    if (config.customInstructions) {
      prompt += `\n\n## Custom Project Rules:\n${config.customInstructions}\n`;
    }

    // Add existing issues (tell agent NOT to re-report)
    if (existingIssues.length > 0) {
      prompt += this.buildExistingIssuesSection(existingIssues);
    }

    // Add output format
    prompt += this.outputFormat;

    return prompt;
  }

  buildExistingIssuesSection(issues: CodeIssue[]): string {
    return `

## 📋 Currently Tracked Issues (${issues.length} total)

**DO NOT report these issues again in your output.**

${issues
  .map(
    (issue, idx) => `
${idx + 1}. **${issue.title}** (Line ${issue.lineNumber})
   - Rule: ${issue.ruleId} | Severity: ${issue.severity}
   - Description: ${issue.description}
`
  )
  .join('\n')}

**Your Task**: Find ONLY NEW issues not in the list above.
`;
  }

  buildUserPrompt(filePath: string, fileContent: string): string {
    return `Please perform a comprehensive code review of the following code.

File: ${filePath}

Code:
\`\`\`
${fileContent}
\`\`\`

Analyze the code according to the guidelines and dimensions specified in the system prompt.
Return a JSON object with all identified issues, ordered by severity and category importance.
`;
  }
}

// ============================================================================
// OLLAMA SERVICE
// ============================================================================

export class OllamaService {
  private promptBuilder: CodeReviewPromptBuilder;

  constructor() {
    this.promptBuilder = new CodeReviewPromptBuilder();
  }

  /**
   * Review code using Ollama AI model
   */
  async reviewCode(request: OllamaReviewRequest): Promise<OllamaReviewResponse> {
    const systemPrompt = this.promptBuilder.buildSystemPrompt(
      request.filePath,
      request.config,
      request.existingIssues
    );
    const userPrompt = this.promptBuilder.buildUserPrompt(
      request.filePath,
      request.fileContent
    );

    console.log(`🔍 Reviewing ${request.filePath}...`);
    console.log(`📋 Guidelines: ${request.config.enabledGuidelines.join(', ')}`);
    console.log(`🎯 Dimensions: ${request.config.enabledDimensions.join(', ')}`);

    try {
      const response = await fetch(OLLAMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: request.config.modelName || DEFAULT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: false,
          format: 'json',
          options: {
            temperature: 0.3,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error! status: ${response.status}`);
      }

      const data = await response.json() as any;
      const content = data.message?.content || data.response || '';

      console.log(`✅ Received response from Ollama for ${request.filePath}`);

      // Parse JSON response
      const result = JSON.parse(content) as any;
      return {
        issues: result.issues || [],
      };
    } catch (error) {
      console.error(`❌ Error reviewing ${request.filePath}:`, error);
      throw new Error(`Failed to review code: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if Ollama is available
   */
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(OLLAMA_API_URL.replace('/api/chat', '/api/tags'), {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      console.error('❌ Ollama connection check failed:', error);
      return false;
    }
  }

  /**
   * Check if a specific model is available
   */
  async checkModelAvailability(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(OLLAMA_API_URL.replace('/api/chat', '/api/tags'), {
        method: 'GET',
      });

      if (!response.ok) return false;

      const data = await response.json() as any;
      const models = data.models || [];

      return models.some((m: any) => m.name === modelName);
    } catch (error) {
      console.error('❌ Model availability check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new OllamaService();
