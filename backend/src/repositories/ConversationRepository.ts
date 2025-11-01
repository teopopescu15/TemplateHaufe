import pool from '../config/database';
import { Conversation, Message } from '../types/agent';

export class ConversationRepository {

  // ============================================================================
  // CONVERSATION OPERATIONS
  // ============================================================================

  async createConversation(userId: number, title?: string): Promise<number> {
    const result = await pool.query(
      `INSERT INTO agent_conversations (user_id, title, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id`,
      [userId, title || 'New Conversation']
    );
    return result.rows[0].id;
  }

  async getConversationById(id: number): Promise<Conversation | null> {
    const result = await pool.query(
      `SELECT * FROM agent_conversations WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async getUserConversations(userId: number): Promise<Conversation[]> {
    const result = await pool.query(
      `SELECT
         ac.*,
         COUNT(am.id) as message_count,
         MAX(am.created_at) as last_message_at
       FROM agent_conversations ac
       LEFT JOIN agent_messages am ON ac.id = am.conversation_id
       WHERE ac.user_id = $1
       GROUP BY ac.id
       ORDER BY ac.updated_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async updateConversation(id: number, data: Partial<Conversation>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }

    if (data.openai_conversation_id !== undefined) {
      fields.push(`openai_conversation_id = $${paramIndex++}`);
      values.push(data.openai_conversation_id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    await pool.query(
      `UPDATE agent_conversations SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      values
    );
  }

  async deleteConversation(id: number): Promise<void> {
    // CASCADE will automatically delete messages
    await pool.query(`DELETE FROM agent_conversations WHERE id = $1`, [id]);
  }

  async verifyConversationOwnership(conversationId: number, userId: number): Promise<boolean> {
    const result = await pool.query(
      `SELECT id FROM agent_conversations WHERE id = $1 AND user_id = $2`,
      [conversationId, userId]
    );
    return result.rows.length > 0;
  }

  // ============================================================================
  // MESSAGE OPERATIONS
  // ============================================================================

  async addMessage(
    conversationId: number,
    role: 'user' | 'agent' | 'system',
    content: string,
    agentUsed?: string
  ): Promise<Message> {
    const result = await pool.query(
      `INSERT INTO agent_messages (conversation_id, role, content, agent_used, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [conversationId, role, content, agentUsed || null]
    );

    // Update conversation's updated_at timestamp
    await pool.query(
      `UPDATE agent_conversations SET updated_at = NOW() WHERE id = $1`,
      [conversationId]
    );

    return result.rows[0];
  }

  async getConversationMessages(conversationId: number, limit: number = 100): Promise<Message[]> {
    const result = await pool.query(
      `SELECT * FROM agent_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC
       LIMIT $2`,
      [conversationId, limit]
    );
    return result.rows;
  }

  async getMessageCount(conversationId: number): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM agent_messages WHERE conversation_id = $1`,
      [conversationId]
    );
    return parseInt(result.rows[0].count);
  }

  async getLastMessage(conversationId: number): Promise<Message | null> {
    const result = await pool.query(
      `SELECT * FROM agent_messages
       WHERE conversation_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [conversationId]
    );
    return result.rows[0] || null;
  }
}

// Export singleton instance
export default new ConversationRepository();
