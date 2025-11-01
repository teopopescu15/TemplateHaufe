-- ============================================================================
-- Migration: Add issue comments table
-- Date: 2025-11-01
-- Description: Adds commenting functionality to code review issues
-- ============================================================================

BEGIN;

-- Create issue_comments table
CREATE TABLE IF NOT EXISTS issue_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID NOT NULL REFERENCES code_issues(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_issue_comments_issue_id ON issue_comments(issue_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_user_id ON issue_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_issue_comments_created_at ON issue_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_issue_comments_active ON issue_comments(issue_id) WHERE is_deleted = false;

-- Add table and column comments for documentation
COMMENT ON TABLE issue_comments IS 'User comments and notes on code review issues';
COMMENT ON COLUMN issue_comments.id IS 'Unique identifier for the comment';
COMMENT ON COLUMN issue_comments.issue_id IS 'Foreign key to code_issues table';
COMMENT ON COLUMN issue_comments.user_id IS 'Foreign key to users table - who created the comment';
COMMENT ON COLUMN issue_comments.comment_text IS 'The actual comment text content';
COMMENT ON COLUMN issue_comments.is_deleted IS 'Soft delete flag - allows preserving comment history';
COMMENT ON COLUMN issue_comments.created_at IS 'Timestamp when comment was created';
COMMENT ON COLUMN issue_comments.updated_at IS 'Timestamp when comment was last updated';

COMMIT;
