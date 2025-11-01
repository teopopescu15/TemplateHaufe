/**
 * Frontend types for Code Review feature
 * Mirrors backend types with frontend-friendly serialization
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type IssueSeverity = 'error' | 'warning' | 'info';

export type IssueCategory = 'security' | 'architecture' | 'linting' | 'testing' | 'performance' | 'documentation';

export type IssueStatus = 'active' | 'resolved' | 'dismissed';

export interface CodeIssue {
  id: string;
  projectId: number;
  userId: number;
  filePath: string;
  lineNumber: number;
  columnNumber?: number;
  endLineNumber?: number;
  endColumnNumber?: number;
  severity: IssueSeverity;
  category: IssueCategory;
  ruleId: string;
  title: string;
  description: string;
  suggestion?: string;
  codeSnippet?: string;
  suggestedFix?: string;
  status: IssueStatus;
  isManual: boolean;
  wasResolvedBefore: boolean;
  resolutionCount: number;
  firstDetectedAt: string;
  lastSeenAt: string;
  resolvedAt?: string;
  resolvedBy?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface ReviewConfig {
  id?: number;
  projectId: number;
  userId: number;
  enabledGuidelines: string[];
  enabledDimensions: string[];
  customInstructions?: string;
  modelName: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ReviewConfigInput {
  projectId: number;
  enabledGuidelines: string[];
  enabledDimensions: string[];
  customInstructions?: string;
  modelName?: string;
}

// ============================================================================
// REVIEW METADATA
// ============================================================================

export interface ReviewMetadata {
  filesReviewed: string[];
  filesCount: number;
  totalIssues: number;
  newIssues: number;
  reappearedIssues: number;
  reviewDurationMs: number;
  modelUsed: string;
}

export interface ReviewHistory {
  id: string;
  projectId: number;
  userId: number;
  filesReviewed: string[];
  filesCount: number;
  totalIssues: number;
  newIssues: number;
  reappearedIssues: number;
  reviewDurationMs: number;
  modelUsed: string;
  createdAt: string;
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface TriggerReviewRequest {
  projectId: number;
  config: {
    enabledGuidelines?: string[];
    enabledDimensions?: string[];
    customInstructions?: string;
    modelName?: string;
  };
}

export interface TriggerReviewResponse {
  success: boolean;
  issues: CodeIssue[];
  metadata: ReviewMetadata;
  error?: string;
}

export interface CreateIssueRequest {
  projectId: number;
  filePath: string;
  lineNumber: number;
  columnNumber?: number;
  endLineNumber?: number;
  endColumnNumber?: number;
  severity: IssueSeverity;
  category: IssueCategory;
  ruleId: string;
  title: string;
  description: string;
  suggestion?: string;
  codeSnippet?: string;
  suggestedFix?: string;
}

export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  suggestion?: string;
  suggestedFix?: string;
  severity?: IssueSeverity;
  category?: IssueCategory;
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================

export interface IssueFilterOptions {
  projectId: number;
  status?: IssueStatus;
  severity?: IssueSeverity;
  category?: IssueCategory;
  filePath?: string;
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export interface HealthCheckResponse {
  ollamaAvailable: boolean;
  modelAvailable: boolean;
  status: 'healthy' | 'unhealthy' | 'error';
}

// ============================================================================
// AVAILABLE GUIDELINES & DIMENSIONS
// ============================================================================

export const AVAILABLE_GUIDELINES = [
  { id: 'eslint', name: 'ESLint / Airbnb JavaScript/TypeScript', description: 'JavaScript/TypeScript code style' },
  { id: 'pep8', name: 'PEP 8', description: 'Python code style' },
  { id: 'googleStyle', name: 'Google Style Guide', description: 'Multi-language style guide' },
] as const;

export const AVAILABLE_DIMENSIONS = [
  { id: 'security', name: 'Security', description: 'OWASP Top 10 vulnerabilities', icon: '🔒' },
  { id: 'linting', name: 'Linting & Style', description: 'Code style and formatting', icon: '✨' },
  { id: 'architecture', name: 'Architecture', description: 'Clean code principles', icon: '🏗️' },
  { id: 'testing', name: 'Testing', description: 'Test coverage and quality', icon: '🧪' },
  { id: 'performance', name: 'Performance', description: 'Optimization opportunities', icon: '⚡' },
  { id: 'documentation', name: 'Documentation', description: 'Missing or outdated docs', icon: '📚' },
] as const;

// ============================================================================
// ISSUE STATISTICS
// ============================================================================

export interface IssueStats {
  total: number;
  active: number;
  resolved: number;
  dismissed: number;
  bySeverity: {
    error: number;
    warning: number;
    info: number;
  };
  byCategory: {
    security: number;
    architecture: number;
    linting: number;
    testing: number;
    performance: number;
    documentation: number;
  };
  reappeared: number;
}

// ============================================================================
// ISSUE COMMENTS
// ============================================================================

export interface IssueComment {
  id: string;
  issueId: string;
  userId: number;
  commentText: string;
  createdAt: string;
  updatedAt: string;
  user: {
    displayName: string;
    email: string;
    profilePicture?: string;
  };
}

export interface CreateCommentRequest {
  commentText: string;
}

export interface UpdateCommentRequest {
  commentText: string;
}
