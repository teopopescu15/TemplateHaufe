import api from './api';
import type {
  CodeIssue,
  ReviewConfig,
  ReviewHistory,
  TriggerReviewRequest,
  TriggerReviewResponse,
  CreateIssueRequest,
  UpdateIssueRequest,
  ReviewConfigInput,
  IssueFilterOptions,
  HealthCheckResponse,
  IssueComment,
  CreateCommentRequest,
  UpdateCommentRequest,
} from '../types/codeReview';

/**
 * Code Review API Service
 * Handles all API calls related to AI code review functionality
 */
export const codeReviewApi = {
  // ============================================================================
  // REVIEW OPERATIONS
  // ============================================================================

  /**
   * Trigger AI code review for a project
   */
  async triggerReview(request: TriggerReviewRequest): Promise<TriggerReviewResponse> {
    const response = await api.post('/code-review/review', request);
    return response.data;
  },

  /**
   * Check Ollama service health and model availability
   */
  async checkHealth(): Promise<HealthCheckResponse> {
    const response = await api.get('/code-review/health');
    return response.data;
  },

  // ============================================================================
  // ISSUE MANAGEMENT
  // ============================================================================

  /**
   * Get all issues for a project with optional filters
   */
  async getIssues(projectId: number, filters?: Omit<IssueFilterOptions, 'projectId'>): Promise<CodeIssue[]> {
    const params = new URLSearchParams();

    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.filePath) params.append('filePath', filters.filePath);

    const queryString = params.toString();
    const url = `/code-review/issues/${projectId}${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(url);
    return response.data.issues;
  },

  /**
   * Create a manual code issue
   */
  async createIssue(issue: CreateIssueRequest): Promise<CodeIssue> {
    const response = await api.post('/code-review/issues', issue);
    return response.data.issue;
  },

  /**
   * Update an existing issue
   */
  async updateIssue(issueId: string, updates: UpdateIssueRequest): Promise<CodeIssue> {
    const response = await api.put(`/code-review/issues/${issueId}`, updates);
    return response.data.issue;
  },

  /**
   * Delete an issue
   */
  async deleteIssue(issueId: string): Promise<void> {
    await api.delete(`/code-review/issues/${issueId}`);
  },

  /**
   * Mark an issue as resolved
   */
  async resolveIssue(issueId: string): Promise<CodeIssue> {
    const response = await api.post(`/code-review/issues/${issueId}/resolve`);
    return response.data.issue;
  },

  /**
   * Mark an issue as dismissed
   */
  async dismissIssue(issueId: string): Promise<CodeIssue> {
    const response = await api.post(`/code-review/issues/${issueId}/dismiss`);
    return response.data.issue;
  },

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  /**
   * Get review configuration for a project
   */
  async getConfig(projectId: number): Promise<ReviewConfig> {
    const response = await api.get(`/code-review/config/${projectId}`);
    return response.data.config;
  },

  /**
   * Save or update review configuration
   */
  async saveConfig(config: ReviewConfigInput): Promise<ReviewConfig> {
    const response = await api.post('/code-review/config', config);
    return response.data.config;
  },

  // ============================================================================
  // HISTORY & ANALYTICS
  // ============================================================================

  /**
   * Get review history for a project
   */
  async getHistory(projectId: number, limit: number = 10): Promise<ReviewHistory[]> {
    const response = await api.get(`/code-review/history/${projectId}?limit=${limit}`);
    return response.data.history;
  },

  // ============================================================================
  // COMMENT MANAGEMENT
  // ============================================================================

  /**
   * Get all comments for an issue
   */
  async getComments(issueId: string): Promise<IssueComment[]> {
    const response = await api.get(`/code-review/issues/${issueId}/comments`);
    return response.data.comments;
  },

  /**
   * Create a comment on an issue
   */
  async createComment(issueId: string, request: CreateCommentRequest): Promise<IssueComment> {
    const response = await api.post(`/code-review/issues/${issueId}/comments`, request);
    return response.data.comment;
  },

  /**
   * Update a comment
   */
  async updateComment(commentId: string, request: UpdateCommentRequest): Promise<IssueComment> {
    const response = await api.put(`/code-review/comments/${commentId}`, request);
    return response.data.comment;
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    await api.delete(`/code-review/comments/${commentId}`);
  },
};
