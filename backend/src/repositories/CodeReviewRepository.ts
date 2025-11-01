import pool from '../config/database';
import {
  CodeIssue,
  CodeIssueRow,
  ReviewConfig,
  ReviewConfigRow,
  ReviewHistory,
  ReviewHistoryRow,
  CreateIssueRequest,
  UpdateIssueRequest,
  IssueFilterOptions,
  IssueComment,
  IssueCommentRow,
} from '../types/codeReview';

// ============================================================================
// HELPER FUNCTIONS - Database row conversion
// ============================================================================

/**
 * Convert database row to CodeIssue object
 */
function rowToCodeIssue(row: CodeIssueRow): CodeIssue {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    filePath: row.file_path,
    lineNumber: row.line_number,
    columnNumber: row.column_number,
    endLineNumber: row.end_line_number,
    endColumnNumber: row.end_column_number,
    severity: row.severity as CodeIssue['severity'],
    category: row.category as CodeIssue['category'],
    ruleId: row.rule_id,
    title: row.title,
    description: row.description,
    suggestion: row.suggestion,
    codeSnippet: row.code_snippet,
    suggestedFix: row.suggested_fix,
    status: row.status as CodeIssue['status'],
    isManual: row.is_manual,
    wasResolvedBefore: row.was_resolved_before,
    resolutionCount: row.resolution_count,
    firstDetectedAt: row.first_detected_at,
    lastSeenAt: row.last_seen_at,
    resolvedAt: row.resolved_at,
    resolvedBy: row.resolved_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert database row to ReviewConfig object
 */
function rowToReviewConfig(row: ReviewConfigRow): ReviewConfig {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    enabledGuidelines: row.enabled_guidelines,
    enabledDimensions: row.enabled_dimensions,
    customInstructions: row.custom_instructions,
    modelName: row.model_name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Convert database row to ReviewHistory object
 */
function rowToReviewHistory(row: ReviewHistoryRow): ReviewHistory {
  return {
    id: row.id,
    projectId: row.project_id,
    userId: row.user_id,
    filesReviewed: row.files_reviewed,
    filesCount: row.files_count,
    totalIssues: row.total_issues,
    newIssues: row.new_issues,
    reappearedIssues: row.reappeared_issues,
    reviewDurationMs: row.review_duration_ms,
    modelUsed: row.model_used,
    createdAt: row.created_at,
  };
}

// ============================================================================
// CODE ISSUES REPOSITORY
// ============================================================================

/**
 * Get all active issues for a project
 */
export async function getActiveIssues(projectId: number): Promise<CodeIssue[]> {
  const result = await pool.query<CodeIssueRow>(
    `SELECT * FROM code_issues
     WHERE project_id = $1 AND status = 'active'
     ORDER BY severity DESC, line_number ASC`,
    [projectId]
  );
  return result.rows.map(rowToCodeIssue);
}

/**
 * Get issues with filters
 */
export async function getIssues(filters: IssueFilterOptions): Promise<CodeIssue[]> {
  let query = 'SELECT * FROM code_issues WHERE project_id = $1';
  const params: any[] = [filters.projectId];
  let paramIndex = 2;

  if (filters.status) {
    query += ` AND status = $${paramIndex}`;
    params.push(filters.status);
    paramIndex++;
  }

  if (filters.severity) {
    query += ` AND severity = $${paramIndex}`;
    params.push(filters.severity);
    paramIndex++;
  }

  if (filters.category) {
    query += ` AND category = $${paramIndex}`;
    params.push(filters.category);
    paramIndex++;
  }

  if (filters.filePath) {
    query += ` AND file_path = $${paramIndex}`;
    params.push(filters.filePath);
    paramIndex++;
  }

  query += ' ORDER BY severity DESC, line_number ASC';

  const result = await pool.query<CodeIssueRow>(query, params);
  return result.rows.map(rowToCodeIssue);
}

/**
 * Get issue by ID
 */
export async function getIssueById(id: string): Promise<CodeIssue | null> {
  const result = await pool.query<CodeIssueRow>(
    'SELECT * FROM code_issues WHERE id = $1',
    [id]
  );
  return result.rows.length === 0 ? null : rowToCodeIssue(result.rows[0]);
}

/**
 * Create a new code issue
 */
export async function createIssue(issue: CreateIssueRequest & { isManual?: boolean }): Promise<CodeIssue> {
  const result = await pool.query<CodeIssueRow>(
    `INSERT INTO code_issues (
      project_id, user_id, file_path, line_number, column_number,
      end_line_number, end_column_number, severity, category, rule_id,
      title, description, suggestion, code_snippet, suggested_fix, is_manual
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      issue.projectId,
      issue.userId,
      issue.filePath,
      issue.lineNumber,
      issue.columnNumber || null,
      issue.endLineNumber || null,
      issue.endColumnNumber || null,
      issue.severity,
      issue.category,
      issue.ruleId,
      issue.title,
      issue.description,
      issue.suggestion || null,
      issue.codeSnippet || null,
      issue.suggestedFix || null,
      issue.isManual || false,
    ]
  );
  return rowToCodeIssue(result.rows[0]);
}

/**
 * Update an existing issue
 */
export async function updateIssue(id: string, updates: UpdateIssueRequest): Promise<CodeIssue> {
  const fields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramIndex}`);
    params.push(updates.title);
    paramIndex++;
  }

  if (updates.description !== undefined) {
    fields.push(`description = $${paramIndex}`);
    params.push(updates.description);
    paramIndex++;
  }

  if (updates.suggestion !== undefined) {
    fields.push(`suggestion = $${paramIndex}`);
    params.push(updates.suggestion);
    paramIndex++;
  }

  if (updates.suggestedFix !== undefined) {
    fields.push(`suggested_fix = $${paramIndex}`);
    params.push(updates.suggestedFix);
    paramIndex++;
  }

  if (updates.severity !== undefined) {
    fields.push(`severity = $${paramIndex}`);
    params.push(updates.severity);
    paramIndex++;
  }

  if (updates.category !== undefined) {
    fields.push(`category = $${paramIndex}`);
    params.push(updates.category);
    paramIndex++;
  }

  fields.push(`updated_at = NOW()`);
  params.push(id);

  const query = `
    UPDATE code_issues
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `;

  const result = await pool.query<CodeIssueRow>(query, params);
  return rowToCodeIssue(result.rows[0]);
}

/**
 * Delete an issue
 */
export async function deleteIssue(id: string, userId: number): Promise<void> {
  await pool.query(
    'DELETE FROM code_issues WHERE id = $1 AND user_id = $2',
    [id, userId]
  );
}

/**
 * Mark an issue as resolved
 */
export async function markAsResolved(id: string, userId: number): Promise<CodeIssue> {
  const result = await pool.query<CodeIssueRow>(
    `UPDATE code_issues
     SET status = 'resolved',
         resolved_at = NOW(),
         resolved_by = $2,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, userId]
  );
  return rowToCodeIssue(result.rows[0]);
}

/**
 * Mark an issue as dismissed
 */
export async function markAsDismissed(id: string): Promise<CodeIssue> {
  const result = await pool.query<CodeIssueRow>(
    `UPDATE code_issues
     SET status = 'dismissed',
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return rowToCodeIssue(result.rows[0]);
}

/**
 * Check if a similar issue was resolved before (for re-appearance detection)
 * Matches issues within ±3 lines with same rule_id
 */
export async function checkForReappearance(
  projectId: number,
  filePath: string,
  lineNumber: number,
  ruleId: string
): Promise<CodeIssue | null> {
  const result = await pool.query<CodeIssueRow>(
    `SELECT * FROM code_issues
     WHERE project_id = $1
       AND file_path = $2
       AND rule_id = $3
       AND status = 'resolved'
       AND line_number BETWEEN $4 AND $5
     ORDER BY resolved_at DESC
     LIMIT 1`,
    [projectId, filePath, ruleId, lineNumber - 3, lineNumber + 3]
  );

  return result.rows.length === 0 ? null : rowToCodeIssue(result.rows[0]);
}

/**
 * Create issue with re-appearance tracking
 */
export async function createIssueWithReappearance(
  issue: CreateIssueRequest,
  previousIssue: CodeIssue | null
): Promise<CodeIssue> {
  if (previousIssue) {
    // Create new issue marked as re-appeared
    const result = await pool.query<CodeIssueRow>(
      `INSERT INTO code_issues (
        project_id, user_id, file_path, line_number, column_number,
        end_line_number, end_column_number, severity, category, rule_id,
        title, description, suggestion, code_snippet, suggested_fix,
        was_resolved_before, resolution_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        issue.projectId,
        issue.userId,
        issue.filePath,
        issue.lineNumber,
        issue.columnNumber || null,
        issue.endLineNumber || null,
        issue.endColumnNumber || null,
        issue.severity,
        issue.category,
        issue.ruleId,
        issue.title,
        issue.description,
        issue.suggestion || null,
        issue.codeSnippet || null,
        issue.suggestedFix || null,
        true, // was_resolved_before
        previousIssue.resolutionCount + 1,
      ]
    );
    return rowToCodeIssue(result.rows[0]);
  } else {
    // Create normal new issue
    return createIssue(issue);
  }
}

/**
 * Update last_seen_at timestamp for an issue
 */
export async function updateLastSeen(id: string): Promise<void> {
  await pool.query(
    'UPDATE code_issues SET last_seen_at = NOW(), updated_at = NOW() WHERE id = $1',
    [id]
  );
}

// ============================================================================
// REVIEW CONFIGURATION REPOSITORY
// ============================================================================

/**
 * Get review configuration for a project
 */
export async function getConfig(projectId: number): Promise<ReviewConfig | null> {
  const result = await pool.query<ReviewConfigRow>(
    'SELECT * FROM code_review_config WHERE project_id = $1',
    [projectId]
  );
  return result.rows.length === 0 ? null : rowToReviewConfig(result.rows[0]);
}

/**
 * Save or update review configuration
 */
export async function saveConfig(config: Omit<ReviewConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReviewConfig> {
  const result = await pool.query<ReviewConfigRow>(
    `INSERT INTO code_review_config (
      project_id, user_id, enabled_guidelines, enabled_dimensions,
      custom_instructions, model_name
    ) VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (project_id)
    DO UPDATE SET
      enabled_guidelines = $3,
      enabled_dimensions = $4,
      custom_instructions = $5,
      model_name = $6,
      updated_at = NOW()
    RETURNING *`,
    [
      config.projectId,
      config.userId,
      JSON.stringify(config.enabledGuidelines),
      JSON.stringify(config.enabledDimensions),
      config.customInstructions || null,
      config.modelName,
    ]
  );
  return rowToReviewConfig(result.rows[0]);
}

/**
 * Delete review configuration for a project
 */
export async function deleteConfig(projectId: number): Promise<void> {
  await pool.query('DELETE FROM code_review_config WHERE project_id = $1', [projectId]);
}

// ============================================================================
// REVIEW HISTORY REPOSITORY
// ============================================================================

/**
 * Create a review history record
 */
export async function createReviewHistory(history: Omit<ReviewHistory, 'id' | 'createdAt'>): Promise<ReviewHistory> {
  const result = await pool.query<ReviewHistoryRow>(
    `INSERT INTO code_review_history (
      project_id, user_id, files_reviewed, files_count,
      total_issues, new_issues, reappeared_issues,
      review_duration_ms, model_used
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      history.projectId,
      history.userId,
      JSON.stringify(history.filesReviewed),
      history.filesCount,
      history.totalIssues,
      history.newIssues,
      history.reappearedIssues,
      history.reviewDurationMs,
      history.modelUsed,
    ]
  );
  return rowToReviewHistory(result.rows[0]);
}

/**
 * Get review history for a project
 */
export async function getReviewHistory(projectId: number, limit: number = 10): Promise<ReviewHistory[]> {
  const result = await pool.query<ReviewHistoryRow>(
    `SELECT * FROM code_review_history
     WHERE project_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [projectId, limit]
  );
  return result.rows.map(rowToReviewHistory);
}

/**
 * Get review statistics for a project
 */
export async function getReviewStats(projectId: number): Promise<{
  totalReviews: number;
  totalIssuesFound: number;
  averageDurationMs: number;
  lastReviewAt: Date | null;
}> {
  const result = await pool.query(
    `SELECT
       COUNT(*) as total_reviews,
       COALESCE(SUM(total_issues), 0) as total_issues_found,
       COALESCE(AVG(review_duration_ms), 0) as average_duration_ms,
       MAX(created_at) as last_review_at
     FROM code_review_history
     WHERE project_id = $1`,
    [projectId]
  );

  const row = result.rows[0];
  return {
    totalReviews: parseInt(row.total_reviews, 10),
    totalIssuesFound: parseInt(row.total_issues_found, 10),
    averageDurationMs: parseFloat(row.average_duration_ms),
    lastReviewAt: row.last_review_at,
  };
}

// ============================================================================
// ISSUE COMMENTS REPOSITORY
// ============================================================================

/**
 * Convert database row to IssueComment object
 */
function rowToIssueComment(row: IssueCommentRow): IssueComment {
  return {
    id: row.id,
    issueId: row.issue_id,
    userId: row.user_id,
    commentText: row.comment_text,
    isDeleted: row.is_deleted,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userDisplayName: row.display_name,
    userEmail: row.email,
    userProfilePicture: row.profile_picture,
  };
}

/**
 * Get all comments for an issue (with user info)
 */
export async function getCommentsByIssueId(issueId: string): Promise<IssueComment[]> {
  const result = await pool.query<IssueCommentRow>(
    `SELECT
      ic.*,
      u.display_name,
      u.email,
      u.profile_picture
     FROM issue_comments ic
     INNER JOIN users u ON ic.user_id = u.id
     WHERE ic.issue_id = $1 AND ic.is_deleted = false
     ORDER BY ic.created_at ASC`,
    [issueId]
  );
  return result.rows.map(rowToIssueComment);
}

/**
 * Get a single comment by ID (with user info)
 */
export async function getCommentById(commentId: string): Promise<IssueComment | null> {
  const result = await pool.query<IssueCommentRow>(
    `SELECT
      ic.*,
      u.display_name,
      u.email,
      u.profile_picture
     FROM issue_comments ic
     INNER JOIN users u ON ic.user_id = u.id
     WHERE ic.id = $1 AND ic.is_deleted = false`,
    [commentId]
  );
  return result.rows.length === 0 ? null : rowToIssueComment(result.rows[0]);
}

/**
 * Create a new comment
 */
export async function createComment(
  issueId: string,
  userId: number,
  commentText: string
): Promise<IssueComment> {
  const result = await pool.query<IssueCommentRow>(
    `INSERT INTO issue_comments (issue_id, user_id, comment_text)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [issueId, userId, commentText]
  );

  // Fetch with user info
  const comment = await getCommentById(result.rows[0].id);
  if (!comment) {
    throw new Error('Failed to create comment');
  }
  return comment;
}

/**
 * Update a comment (only by the user who created it)
 */
export async function updateComment(
  commentId: string,
  userId: number,
  commentText: string
): Promise<IssueComment | null> {
  const result = await pool.query<IssueCommentRow>(
    `UPDATE issue_comments
     SET comment_text = $1, updated_at = NOW()
     WHERE id = $2 AND user_id = $3 AND is_deleted = false
     RETURNING *`,
    [commentText, commentId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return await getCommentById(commentId);
}

/**
 * Delete a comment (soft delete - only by the user who created it)
 */
export async function deleteComment(commentId: string, userId: number): Promise<boolean> {
  const result = await pool.query(
    `UPDATE issue_comments
     SET is_deleted = true, updated_at = NOW()
     WHERE id = $1 AND user_id = $2 AND is_deleted = false`,
    [commentId, userId]
  );

  return result.rowCount !== null && result.rowCount > 0;
}

/**
 * Get comment count for an issue
 */
export async function getCommentCount(issueId: string): Promise<number> {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*) as count
     FROM issue_comments
     WHERE issue_id = $1 AND is_deleted = false`,
    [issueId]
  );

  return parseInt(result.rows[0].count, 10);
}
