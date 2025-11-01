// ============================================================================
// CODE REVIEW TYPES - AI-Powered Code Review System
// ============================================================================

/**
 * Severity levels for code issues
 */
export type IssueSeverity = 'error' | 'warning' | 'info';

/**
 * Categories for code issues
 */
export type IssueCategory = 'security' | 'architecture' | 'linting' | 'testing' | 'performance' | 'documentation';

/**
 * Issue lifecycle status
 */
export type IssueStatus = 'active' | 'resolved' | 'dismissed';

/**
 * Code Issue - Represents a detected or manually added code issue
 */
export interface CodeIssue {
  id: string;

  // Association
  projectId: number;
  userId: number;

  // Issue location
  filePath: string;
  lineNumber: number;
  columnNumber?: number;
  endLineNumber?: number;
  endColumnNumber?: number;

  // Issue details
  severity: IssueSeverity;
  category: IssueCategory;
  ruleId: string;

  title: string;
  description: string;
  suggestion?: string;
  codeSnippet?: string;
  suggestedFix?: string;

  // Lifecycle tracking
  status: IssueStatus;
  isManual: boolean;

  // Re-appearance detection
  wasResolvedBefore: boolean;
  resolutionCount: number;

  // Timestamps
  firstDetectedAt: Date;
  lastSeenAt: Date;
  resolvedAt?: Date;
  resolvedBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Database row for code_issues table
 */
export interface CodeIssueRow {
  id: string;
  project_id: number;
  user_id: number;
  file_path: string;
  line_number: number;
  column_number?: number;
  end_line_number?: number;
  end_column_number?: number;
  severity: string;
  category: string;
  rule_id: string;
  title: string;
  description: string;
  suggestion?: string;
  code_snippet?: string;
  suggested_fix?: string;
  status: string;
  is_manual: boolean;
  was_resolved_before: boolean;
  resolution_count: number;
  first_detected_at: Date;
  last_seen_at: Date;
  resolved_at?: Date;
  resolved_by?: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Review Configuration - Stores per-project review settings
 */
export interface ReviewConfig {
  id?: number;
  projectId: number;
  userId: number;
  enabledGuidelines: string[];
  enabledDimensions: string[];
  customInstructions?: string;
  modelName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Database row for code_review_config table
 */
export interface ReviewConfigRow {
  id: number;
  project_id: number;
  user_id: number;
  enabled_guidelines: string[]; // JSONB
  enabled_dimensions: string[]; // JSONB
  custom_instructions?: string;
  model_name: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Review History - Tracks review sessions
 */
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
  createdAt: Date;
}

/**
 * Database row for code_review_history table
 */
export interface ReviewHistoryRow {
  id: string;
  project_id: number;
  user_id: number;
  files_reviewed: string[]; // JSONB
  files_count: number;
  total_issues: number;
  new_issues: number;
  reappeared_issues: number;
  review_duration_ms: number;
  model_used: string;
  created_at: Date;
}

/**
 * Review Request - Payload for triggering a code review
 */
export interface ReviewRequest {
  projectId: number;
  userId: number;
  config: Omit<ReviewConfig, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Review Result - Response from a completed review
 */
export interface ReviewResult {
  success: boolean;
  issues: CodeIssue[];
  metadata: {
    filesReviewed: string[];
    filesCount: number;
    totalIssues: number;
    newIssues: number;
    reappearedIssues: number;
    reviewDurationMs: number;
    modelUsed: string;
  };
  error?: string;
}

/**
 * Create Issue Request - Payload for manually creating an issue
 */
export interface CreateIssueRequest {
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
}

/**
 * Update Issue Request - Payload for updating an existing issue
 */
export interface UpdateIssueRequest {
  title?: string;
  description?: string;
  suggestion?: string;
  suggestedFix?: string;
  severity?: IssueSeverity;
  category?: IssueCategory;
}

/**
 * Ollama Review Request - Payload for Ollama service
 */
export interface OllamaReviewRequest {
  filePath: string;
  fileContent: string;
  config: ReviewConfig;
  existingIssues: CodeIssue[];
}

/**
 * Ollama Review Response - Response from Ollama service
 */
export interface OllamaReviewResponse {
  issues: Array<{
    line_number: number;
    column_number?: number;
    end_line_number?: number;
    end_column_number?: number;
    severity: IssueSeverity;
    category: IssueCategory;
    rule_id: string;
    title: string;
    description: string;
    suggestion?: string;
    code_snippet?: string;
    suggested_fix?: string;
  }>;
}

/**
 * Issue Filter Options - For filtering issues in queries
 */
export interface IssueFilterOptions {
  projectId: number;
  status?: IssueStatus;
  severity?: IssueSeverity;
  category?: IssueCategory;
  filePath?: string;
}

/**
 * API Response Types
 */
export interface IssuesResponse {
  success: boolean;
  issues?: CodeIssue[];
  error?: string;
}

export interface IssueResponse {
  success: boolean;
  issue?: CodeIssue;
  error?: string;
}

export interface ConfigResponse {
  success: boolean;
  config?: ReviewConfig;
  error?: string;
}

export interface DeleteIssueResponse {
  success: boolean;
  error?: string;
}

// ============================================================================
// ISSUE COMMENTS TYPES
// ============================================================================

/**
 * Issue Comment - User comment on a code review issue
 */
export interface IssueComment {
  id: string;
  issueId: string;
  userId: number;
  commentText: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Optional populated fields (from joins)
  userDisplayName?: string;
  userEmail?: string;
  userProfilePicture?: string;
}

/**
 * Database row for issue_comments table
 */
export interface IssueCommentRow {
  id: string;
  issue_id: string;
  user_id: number;
  comment_text: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;

  // From joins with users table
  display_name?: string;
  email?: string;
  profile_picture?: string;
}

/**
 * Create Comment Request
 */
export interface CreateCommentRequest {
  issueId: string;
  commentText: string;
}

/**
 * Update Comment Request
 */
export interface UpdateCommentRequest {
  commentText: string;
}
