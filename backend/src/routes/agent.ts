import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import * as agentController from '../controllers/agentController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/agent/chat - Send message to agent
router.post('/chat', agentController.sendMessage);

// GET /api/agent/conversations - Get all user conversations
router.get('/conversations', agentController.getConversations);

// POST /api/agent/conversations - Create new conversation
router.post('/conversations', agentController.createNewConversation);

// GET /api/agent/conversations/:id/messages - Get conversation messages
router.get('/conversations/:id/messages', agentController.getConversationMessages);

// DELETE /api/agent/conversations/:id - Delete conversation
router.delete('/conversations/:id', agentController.deleteConversation);

export default router;
