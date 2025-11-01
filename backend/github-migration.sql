-- GitHub IDE Integration Tables

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
