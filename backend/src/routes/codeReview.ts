import express from 'express';
import { body, param } from 'express-validator';
import codeReviewController from '../controllers/codeReviewController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation rules
const triggerReviewValidators = [
  body('projectId').isInt().withMessage('Project ID must be an integer'),
  body('config').isObject().withMessage('Config must be an object'),
  body('config.enabledGuidelines')
    .optional()
    .isArray()
    .withMessage('Enabled guidelines must be an array'),
  body('config.enabledDimensions')
    .optional()
    .isArray()
    .withMessage('Enabled dimensions must be an array'),
  body('config.customInstructions').optional().isString(),
  body('config.modelName').optional().isString(),
];

const createIssueValidators = [
  body('projectId').isInt().withMessage('Project ID must be an integer'),
  body('filePath').trim().notEmpty().withMessage('File path is required'),
  body('lineNumber').isInt({ min: 1 }).withMessage('Line number must be a positive integer'),
  body('columnNumber').optional().isInt({ min: 0 }),
  body('endLineNumber').optional().isInt({ min: 1 }),
  body('endColumnNumber').optional().isInt({ min: 0 }),
  body('severity')
    .isIn(['error', 'warning', 'info'])
    .withMessage('Severity must be error, warning, or info'),
  body('category')
    .isIn(['security', 'architecture', 'linting', 'testing', 'performance'])
    .withMessage('Category must be security, architecture, linting, testing, or performance'),
  body('ruleId').trim().notEmpty().withMessage('Rule ID is required'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('suggestion').optional().isString(),
  body('codeSnippet').optional().isString(),
  body('suggestedFix').optional().isString(),
];

const updateIssueValidators = [
  param('id').isUUID().withMessage('Issue ID must be a valid UUID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim().notEmpty().withMessage('Description cannot be empty'),
  body('suggestion').optional().isString(),
  body('suggestedFix').optional().isString(),
  body('severity')
    .optional()
    .isIn(['error', 'warning', 'info'])
    .withMessage('Severity must be error, warning, or info'),
  body('category')
    .optional()
    .isIn(['security', 'architecture', 'linting', 'testing', 'performance'])
    .withMessage('Category must be security, architecture, linting, testing, or performance'),
];

const saveConfigValidators = [
  body('projectId').isInt().withMessage('Project ID must be an integer'),
  body('enabledGuidelines').isArray().withMessage('Enabled guidelines must be an array'),
  body('enabledDimensions').isArray().withMessage('Enabled dimensions must be an array'),
  body('customInstructions').optional().isString(),
  body('modelName').optional().isString(),
];

const createCommentValidators = [
  param('issueId').isUUID().withMessage('Issue ID must be a valid UUID'),
  body('commentText').trim().notEmpty().withMessage('Comment text is required'),
];

const updateCommentValidators = [
  param('commentId').isUUID().withMessage('Comment ID must be a valid UUID'),
  body('commentText').trim().notEmpty().withMessage('Comment text is required'),
];

// All routes require authentication
router.use(authenticateToken);

// Review endpoints
router.post('/review', triggerReviewValidators, codeReviewController.triggerReview);
router.get('/health', codeReviewController.checkHealth);

// Issue management endpoints
router.get('/issues/:projectId', codeReviewController.getIssues);
router.post('/issues', createIssueValidators, codeReviewController.createIssue);
router.put('/issues/:id', updateIssueValidators, codeReviewController.updateIssue);
router.delete('/issues/:id', codeReviewController.deleteIssue);
router.post('/issues/:id/resolve', codeReviewController.resolveIssue);
router.post('/issues/:id/dismiss', codeReviewController.dismissIssue);

// Configuration endpoints
router.get('/config/:projectId', codeReviewController.getConfig);
router.post('/config', saveConfigValidators, codeReviewController.saveConfig);

// History endpoint
router.get('/history/:projectId', codeReviewController.getHistory);

// Comment endpoints
router.get('/issues/:issueId/comments', codeReviewController.getComments);
router.post('/issues/:issueId/comments', createCommentValidators, codeReviewController.createComment);
router.put('/comments/:commentId', updateCommentValidators, codeReviewController.updateComment);
router.delete('/comments/:commentId', codeReviewController.deleteComment);

export default router;
