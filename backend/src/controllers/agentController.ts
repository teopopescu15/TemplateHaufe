import { Request, Response } from 'express';
import { runWorkflow, HabitItem } from '../agent/agent';
import conversationRepo from '../repositories/ConversationRepository';

/**
 * POST /api/agent/chat
 * Send a message to the agent
 */
export async function sendMessage(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.user as any)?.id;
    const { message, conversationId } = req.body;

    // Validate input
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ success: false, error: 'Message is required' });
      return;
    }

    if (message.length > 2000) {
      res.status(400).json({ success: false, error: 'Message too long (max 2000 characters)' });
      return;
    }

    let convId = conversationId;
    let isNewConversation = false;

    // If no conversation ID provided, create new conversation
    if (!convId) {
      // Generate title from first message
      const title = message.length > 50 ? message.substring(0, 47) + '...' : message;
      convId = await conversationRepo.createConversation(userId, title);
      isNewConversation = true;
      console.log(`📝 [AGENT] Created new conversation ${convId} for user ${userId}`);
    } else {
      // Verify ownership
      const ownsConversation = await conversationRepo.verifyConversationOwnership(convId, userId);
      if (!ownsConversation) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }
    }

    // Save user message to database
    await conversationRepo.addMessage(convId, 'user', message);

    // Get existing OpenAI conversation ID (if any)
    const conversation = await conversationRepo.getConversationById(convId);
    const openaiConversationId = conversation?.openai_conversation_id || undefined;

    // MOCK EMPTY HABITS LIST (preserves context injection pattern for future)
    const mockHabits: HabitItem[] = [];
    // Future: Replace with actual user habits
    // const mockHabits = await habitRepository.getUserHabits(userId);

    console.log(`🤖 [AGENT] Calling agent for conversation ${convId}, user ${userId}`);

    // Call agent workflow
    const result = await runWorkflow({
      input_as_text: message,
      habit_list: mockHabits,
      openai_conversation_id: openaiConversationId,
      user_id: `user_${userId}`
    });

    console.log(`✅ [AGENT] Agent responded: ${result.agent_used}`);

    // Save new OpenAI conversation ID if we got one
    if (result.openai_conversation_id && result.openai_conversation_id !== openaiConversationId) {
      await conversationRepo.updateConversation(convId, {
        openai_conversation_id: result.openai_conversation_id
      });
      console.log(`💾 [AGENT] Saved OpenAI conversation ID: ${result.openai_conversation_id}`);
    }

    // Save agent response to database
    const agentMessage = await conversationRepo.addMessage(
      convId,
      'agent',
      result.output_text,
      result.agent_used
    );

    res.json({
      success: true,
      conversationId: convId,
      isNewConversation,
      message: agentMessage
    });

  } catch (error: any) {
    console.error('❌ [AGENT] Error:', error);

    // Handle specific OpenAI errors
    if (error.status === 429) {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded. Please try again later.'
      });
      return;
    }

    if (error.status === 401) {
      res.status(500).json({
        success: false,
        error: 'API configuration error'
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process request',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * GET /api/agent/conversations
 * Get all user conversations
 */
export async function getConversations(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.user as any)?.id;
    const conversations = await conversationRepo.getUserConversations(userId);

    // Get last message for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const lastMessage = await conversationRepo.getLastMessage(conv.id);
        return {
          ...conv,
          lastMessage: lastMessage?.content.substring(0, 100) || null,
          lastMessageAt: lastMessage?.created_at || conv.updated_at
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithDetails
    });

  } catch (error: any) {
    console.error('❌ [AGENT] Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversations'
    });
  }
}

/**
 * GET /api/agent/conversations/:id/messages
 * Get messages for a specific conversation
 */
export async function getConversationMessages(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.user as any)?.id;
    const conversationId = parseInt(req.params.id);
    const limit = parseInt(req.query.limit as string) || 100;

    // Verify ownership
    const ownsConversation = await conversationRepo.verifyConversationOwnership(conversationId, userId);
    if (!ownsConversation) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    const messages = await conversationRepo.getConversationMessages(conversationId, limit);

    res.json({
      success: true,
      messages
    });

  } catch (error: any) {
    console.error('❌ [AGENT] Error fetching messages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch messages'
    });
  }
}

/**
 * POST /api/agent/conversations
 * Create a new conversation
 */
export async function createNewConversation(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.user as any)?.id;
    const { title } = req.body;

    const conversationId = await conversationRepo.createConversation(
      userId,
      title || 'New Conversation'
    );

    res.json({
      success: true,
      conversationId
    });

  } catch (error: any) {
    console.error('❌ [AGENT] Error creating conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create conversation'
    });
  }
}

/**
 * DELETE /api/agent/conversations/:id
 * Delete a conversation
 */
export async function deleteConversation(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req.user as any)?.id;
    const conversationId = parseInt(req.params.id);

    // Verify ownership
    const ownsConversation = await conversationRepo.verifyConversationOwnership(conversationId, userId);
    if (!ownsConversation) {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }

    await conversationRepo.deleteConversation(conversationId);

    res.json({
      success: true
    });

  } catch (error: any) {
    console.error('❌ [AGENT] Error deleting conversation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete conversation'
    });
  }
}
