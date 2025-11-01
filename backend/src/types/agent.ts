export interface HabitItem {
  name: string;
  time: string;
  achieved: boolean;
}

export interface WorkflowInput {
  input_as_text: string;
  habit_list?: HabitItem[];
  openai_conversation_id?: string;
  user_id: string;
}

export interface WorkflowOutput {
  output_text: string;
  agent_used: string;
  openai_conversation_id?: string;
}

export interface Conversation {
  id: number;
  user_id: number;
  title: string;
  openai_conversation_id: string | null;
  created_at: Date;
  updated_at: Date;
  message_count?: number;
  last_message_at?: Date;
}

export interface Message {
  id: number;
  conversation_id: number;
  role: 'user' | 'agent' | 'system';
  content: string;
  agent_used?: string;
  created_at: Date;
}

export interface MessageResponse {
  success: boolean;
  conversationId?: number;
  isNewConversation?: boolean;
  message?: Message;
  error?: string;
}

export interface ConversationsResponse {
  success: boolean;
  conversations?: Conversation[];
  error?: string;
}

export interface MessagesResponse {
  success: boolean;
  messages?: Message[];
  error?: string;
}
