-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    profile_picture TEXT,
    password_hash VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires TIMESTAMP,
    github_token TEXT,
    github_username VARCHAR(255),
    github_user_id INTEGER,
    github_connected_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on google_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- Create index on verification_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

-- ============================================================================
-- AGENT SYSTEM TABLES
-- ============================================================================

-- Agent conversations table
CREATE TABLE IF NOT EXISTS agent_conversations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) DEFAULT 'New Conversation',
    openai_conversation_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_agent_conversations_user_id ON agent_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_conversations_openai_id ON agent_conversations(openai_conversation_id);

-- Agent messages table
CREATE TABLE IF NOT EXISTS agent_messages (
    id SERIAL PRIMARY KEY,
    conversation_id INTEGER NOT NULL REFERENCES agent_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'agent', 'system')),
    content TEXT NOT NULL,
    agent_used VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_conversation FOREIGN KEY (conversation_id) REFERENCES agent_conversations(id)
);

CREATE INDEX IF NOT EXISTS idx_agent_messages_conversation_id ON agent_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_agent_messages_created_at ON agent_messages(created_at DESC);

-- ============================================================================
-- GITHUB IDE INTEGRATION TABLES
-- ============================================================================

-- Create projects table for storing user projects
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- GitHub repo info
    repo_owner VARCHAR(255) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    repo_full_name VARCHAR(255) NOT NULL,
    default_branch VARCHAR(255) NOT NULL DEFAULT 'main',
    current_branch VARCHAR(255) NOT NULL,

    -- Project metadata
    last_synced_at TIMESTAMP,
    is_private BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint: one project per repo per user per branch
    UNIQUE(user_id, repo_full_name, current_branch)
);

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_repo_full_name ON projects(repo_full_name);

-- Create project_files table for storing file contents
CREATE TABLE IF NOT EXISTS project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- File path and content
    file_path TEXT NOT NULL,
    original_content TEXT,
    current_content TEXT,

    -- Git metadata
    sha VARCHAR(40),
    file_mode VARCHAR(10) DEFAULT '100644',

    -- File status
    status VARCHAR(20) DEFAULT 'unmodified',

    -- Timestamps
    last_modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Unique constraint
    UNIQUE(project_id, file_path)
);

CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_status ON project_files(status);

-- Create project_commits table for caching commit history
CREATE TABLE IF NOT EXISTS project_commits (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Commit info
    commit_sha VARCHAR(40) NOT NULL,
    author_name VARCHAR(255),
    author_email VARCHAR(255),
    commit_message TEXT,
    committed_at TIMESTAMP,

    -- Parent commits
    parent_shas TEXT[],

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(project_id, commit_sha)
);

CREATE INDEX IF NOT EXISTS idx_project_commits_project_id ON project_commits(project_id);
CREATE INDEX IF NOT EXISTS idx_project_commits_sha ON project_commits(commit_sha);

-- ============================================================================
-- AI CODE REVIEW SYSTEM TABLES
-- ============================================================================

-- Table 1: Code Issues - Stores all detected and manual issues with lifecycle tracking
CREATE TABLE IF NOT EXISTS code_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Association
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Issue location
  file_path TEXT NOT NULL,
  line_number INTEGER NOT NULL,
  column_number INTEGER,
  end_line_number INTEGER,
  end_column_number INTEGER,

  -- Issue details
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('error', 'warning', 'info')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('security', 'architecture', 'linting', 'testing', 'performance')),
  rule_id VARCHAR(100) NOT NULL,

  title TEXT NOT NULL,
  description TEXT NOT NULL,
  suggestion TEXT,
  code_snippet TEXT,
  suggested_fix TEXT,

  -- Lifecycle tracking
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'dismissed')),
  is_manual BOOLEAN DEFAULT false,

  -- Re-appearance detection
  was_resolved_before BOOLEAN DEFAULT false,
  resolution_count INTEGER DEFAULT 0,

  -- Timestamps
  first_detected_at TIMESTAMP DEFAULT NOW(),
  last_seen_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP,
  resolved_by INTEGER REFERENCES users(id),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_code_issues_project ON code_issues(project_id);
CREATE INDEX IF NOT EXISTS idx_code_issues_file_status ON code_issues(project_id, file_path, status);
CREATE INDEX IF NOT EXISTS idx_code_issues_active ON code_issues(project_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_code_issues_user ON code_issues(user_id);

-- Table 2: Code Review Configuration - Stores per-project review configuration
CREATE TABLE IF NOT EXISTS code_review_config (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL UNIQUE REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Configuration
  enabled_guidelines JSONB DEFAULT '["eslint", "pep8"]'::jsonb,
  enabled_dimensions JSONB DEFAULT '["security", "linting", "architecture"]'::jsonb,
  custom_instructions TEXT,
  model_name VARCHAR(100) DEFAULT 'gpt-oss:120b-cloud',

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_code_review_config_project ON code_review_config(project_id);
CREATE INDEX IF NOT EXISTS idx_code_review_config_user ON code_review_config(user_id);

-- Table 3: Code Review History - Tracks review sessions for analytics
CREATE TABLE IF NOT EXISTS code_review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Review metadata
  files_reviewed JSONB,
  files_count INTEGER,

  -- Results
  total_issues INTEGER,
  new_issues INTEGER,
  reappeared_issues INTEGER,

  -- Performance
  review_duration_ms INTEGER,
  model_used VARCHAR(100),

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_code_review_history_project ON code_review_history(project_id);
CREATE INDEX IF NOT EXISTS idx_code_review_history_user ON code_review_history(user_id);
CREATE INDEX IF NOT EXISTS idx_code_review_history_created ON code_review_history(created_at DESC);
