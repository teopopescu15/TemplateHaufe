import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { CodeReviewService } from '../services/codeReviewService';
import * as repo from '../repositories/CodeReviewRepository';
import { CreateIssueRequest, UpdateIssueRequest } from '../types/codeReview';

const codeReviewService = new CodeReviewService();

const codeReviewController = {
  /**
   * Trigger AI code review for a project
   * POST /api/code-review/review
   */
  triggerReview: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { projectId, config } = req.body;

      // Trigger the review
      const result = await codeReviewService.orchestrateReview({
        projectId,
        userId,
        config: {
          projectId,
          userId,
          enabledGuidelines: config.enabledGuidelines || ['eslint'],
          enabledDimensions: config.enabledDimensions || ['security', 'linting', 'architecture'],
          customInstructions: config.customInstructions,
          modelName: config.modelName || 'gpt-oss:120b-cloud',
        },
      });

      return res.json({
        success: result.success,
        issues: result.issues,
        metadata: result.metadata,
        error: result.error,
      });
    } catch (err) {
      console.error('Trigger review error:', err);
      return res.status(500).json({ error: 'Server error during code review' });
    }
  },

  /**
   * Get all issues for a project
   * GET /api/code-review/issues/:projectId
   */
  getIssues: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const projectId = parseInt(req.params.projectId, 10);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }

      const { status, severity, category, filePath } = req.query;

      // Use getIssues with filters
      const issues = await repo.getIssues({
        projectId,
        status: status as 'active' | 'resolved' | 'dismissed' | undefined,
        severity: severity as 'error' | 'warning' | 'info' | undefined,
        category: category as 'security' | 'architecture' | 'linting' | 'testing' | 'performance' | undefined,
        filePath: filePath as string | undefined,
      });

      return res.json({ issues });
    } catch (err) {
      console.error('Get issues error:', err);
      return res.status(500).json({ error: 'Server error fetching issues' });
    }
  },

  /**
   * Create a manual issue
   * POST /api/code-review/issues
   */
  createIssue: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const issueData: CreateIssueRequest = {
        ...req.body,
        userId,
      };

      const issue = await repo.createIssue({ ...issueData, isManual: true });

      return res.status(201).json({ issue });
    } catch (err) {
      console.error('Create issue error:', err);
      return res.status(500).json({ error: 'Server error creating issue' });
    }
  },

  /**
   * Update an issue
   * PUT /api/code-review/issues/:id
   */
  updateIssue: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const issueId = req.params.id;
      const updateData: UpdateIssueRequest = req.body;

      const issue = await repo.updateIssue(issueId, updateData);

      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      return res.json({ issue });
    } catch (err) {
      console.error('Update issue error:', err);
      return res.status(500).json({ error: 'Server error updating issue' });
    }
  },

  /**
   * Delete an issue
   * DELETE /api/code-review/issues/:id
   */
  deleteIssue: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const issueId = req.params.id;

      await repo.deleteIssue(issueId, userId);

      return res.json({ message: 'Issue deleted successfully' });
    } catch (err) {
      console.error('Delete issue error:', err);
      return res.status(500).json({ error: 'Server error deleting issue' });
    }
  },

  /**
   * Mark an issue as resolved
   * POST /api/code-review/issues/:id/resolve
   */
  resolveIssue: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const issueId = req.params.id;

      const issue = await repo.markAsResolved(issueId, userId);

      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      return res.json({ issue });
    } catch (err) {
      console.error('Resolve issue error:', err);
      return res.status(500).json({ error: 'Server error resolving issue' });
    }
  },

  /**
   * Mark an issue as dismissed
   * POST /api/code-review/issues/:id/dismiss
   */
  dismissIssue: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const issueId = req.params.id;

      const issue = await repo.markAsDismissed(issueId);

      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      return res.json({ issue });
    } catch (err) {
      console.error('Dismiss issue error:', err);
      return res.status(500).json({ error: 'Server error dismissing issue' });
    }
  },

  /**
   * Get review configuration for a project
   * GET /api/code-review/config/:projectId
   */
  getConfig: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const projectId = parseInt(req.params.projectId, 10);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }

      const config = await repo.getConfig(projectId);

      if (!config) {
        // Return default configuration
        return res.json({
          config: {
            projectId,
            userId,
            enabledGuidelines: ['eslint'],
            enabledDimensions: ['security', 'linting', 'architecture'],
            customInstructions: '',
            modelName: 'gpt-oss:120b-cloud',
          },
        });
      }

      return res.json({ config });
    } catch (err) {
      console.error('Get config error:', err);
      return res.status(500).json({ error: 'Server error fetching configuration' });
    }
  },

  /**
   * Save or update review configuration
   * POST /api/code-review/config
   */
  saveConfig: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const configData = {
        ...req.body,
        userId,
      };

      const config = await repo.saveConfig(configData);

      return res.json({ config });
    } catch (err) {
      console.error('Save config error:', err);
      return res.status(500).json({ error: 'Server error saving configuration' });
    }
  },

  /**
   * Check Ollama health and model availability
   * GET /api/code-review/health
   */
  checkHealth: async (_req: Request, res: Response) => {
    try {
      const health = await codeReviewService.checkHealth();

      return res.json({
        ollamaAvailable: health.ollamaAvailable,
        modelAvailable: health.modelAvailable,
        status: health.ollamaAvailable && health.modelAvailable ? 'healthy' : 'unhealthy',
      });
    } catch (err) {
      console.error('Health check error:', err);
      return res.status(500).json({
        ollamaAvailable: false,
        modelAvailable: false,
        status: 'error',
      });
    }
  },

  /**
   * Get review history for a project
   * GET /api/code-review/history/:projectId
   */
  getHistory: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const projectId = parseInt(req.params.projectId, 10);
      if (isNaN(projectId)) {
        return res.status(400).json({ error: 'Invalid project ID' });
      }

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

      const history = await repo.getReviewHistory(projectId, limit);

      return res.json({ history });
    } catch (err) {
      console.error('Get history error:', err);
      return res.status(500).json({ error: 'Server error fetching review history' });
    }
  },

  // ============================================================================
  // COMMENT MANAGEMENT
  // ============================================================================

  /**
   * Get all comments for an issue
   * GET /api/code-review/issues/:issueId/comments
   */
  getComments: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const issueId = req.params.issueId;

      const comments = await repo.getCommentsByIssueId(issueId);

      return res.json({ comments });
    } catch (err) {
      console.error('Get comments error:', err);
      return res.status(500).json({ error: 'Server error fetching comments' });
    }
  },

  /**
   * Create a comment on an issue
   * POST /api/code-review/issues/:issueId/comments
   */
  createComment: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const issueId = req.params.issueId;
      const { commentText } = req.body;

      // Verify issue exists
      const issue = await repo.getIssueById(issueId);
      if (!issue) {
        return res.status(404).json({ error: 'Issue not found' });
      }

      const comment = await repo.createComment(issueId, userId, commentText);

      return res.status(201).json({ comment });
    } catch (err) {
      console.error('Create comment error:', err);
      return res.status(500).json({ error: 'Server error creating comment' });
    }
  },

  /**
   * Update a comment
   * PUT /api/code-review/comments/:commentId
   */
  updateComment: async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const commentId = req.params.commentId;
      const { commentText } = req.body;

      const comment = await repo.updateComment(commentId, userId, commentText);

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found or unauthorized' });
      }

      return res.json({ comment });
    } catch (err) {
      console.error('Update comment error:', err);
      return res.status(500).json({ error: 'Server error updating comment' });
    }
  },

  /**
   * Delete a comment
   * DELETE /api/code-review/comments/:commentId
   */
  deleteComment: async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const commentId = req.params.commentId;

      const deleted = await repo.deleteComment(commentId, userId);

      if (!deleted) {
        return res.status(404).json({ error: 'Comment not found or unauthorized' });
      }

      return res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
      console.error('Delete comment error:', err);
      return res.status(500).json({ error: 'Server error deleting comment' });
    }
  },
};

export default codeReviewController;
