import express, { Request, Response } from 'express';
import pool from '../config/database';
import { authenticateToken } from '../middleware/auth';
import { JwtPayload } from '../services/jwtService';
import { decryptToken } from '../utils/encryption';
import axios from 'axios';

const router = express.Router();

// Helper function to get GitHub token
async function getGitHubToken(userId: number): Promise<string> {
  const result = await pool.query(
    'SELECT github_token FROM users WHERE id = $1',
    [userId]
  );

  const encryptedToken = result.rows[0]?.github_token;
  if (!encryptedToken) {
    throw new Error('GitHub not connected');
  }

  return decryptToken(encryptedToken);
}

// Helper function to fetch repository tree from GitHub
async function fetchGitHubTree(token: string, owner: string, repo: string, branch: string): Promise<any[]> {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    return response.data.tree.filter((item: any) => item.type === 'blob');
  } catch (error) {
    console.error('Error fetching GitHub tree:', error);
    throw error;
  }
}

// Helper function to fetch file content from GitHub
async function fetchGitHubFileContent(token: string, owner: string, repo: string, path: string, ref: string): Promise<string> {
  try {
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${ref}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    // Decode base64 content
    if (response.data.content) {
      return Buffer.from(response.data.content, 'base64').toString('utf-8');
    }
    return '';
  } catch (error) {
    console.error(`Error fetching file ${path}:`, error);
    throw error;
  }
}

/**
 * POST /api/projects/load
 * Load a GitHub repository and save all files to database
 */
router.post('/load', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const user = req.user as JwtPayload;
  const { repoOwner, repoName, repoFullName, branch, isPrivate, defaultBranch } = req.body;

  if (!repoOwner || !repoName || !repoFullName || !branch) {
    res.status(400).json({ error: 'Missing required fields: repoOwner, repoName, repoFullName, branch' });
    return;
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Check if project already exists
    const existingProject = await client.query(
      `SELECT id FROM projects
       WHERE user_id = $1 AND repo_full_name = $2 AND current_branch = $3`,
      [user.id, repoFullName, branch]
    );

    let projectId: number;

    if (existingProject.rows.length > 0) {
      // Update existing project
      projectId = existingProject.rows[0].id;
      await client.query(
        `UPDATE projects
         SET last_synced_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [projectId]
      );
    } else {
      // Create new project
      const newProject = await client.query(
        `INSERT INTO projects (user_id, repo_owner, repo_name, repo_full_name, default_branch, current_branch, is_private, last_synced_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
         RETURNING id`,
        [user.id, repoOwner, repoName, repoFullName, defaultBranch || branch, branch, isPrivate || false]
      );
      projectId = newProject.rows[0].id;
    }

    // Fetch GitHub tree
    const token = await getGitHubToken(user.id);
    let files: any[] = [];

    try {
      files = await fetchGitHubTree(token, repoOwner, repoName, branch);
    } catch (error: any) {
      // If repository is empty or branch doesn't exist, continue with empty file list
      if (error?.response?.status === 404 || error?.response?.status === 409) {
        console.log(`Repository ${repoFullName} on branch ${branch} is empty or has no commits`);
        files = [];
      } else {
        // Re-throw other errors
        throw error;
      }
    }

    // Filter files (exclude binaries, large files, cache files, sensitive files, etc.)
    const MAX_FILE_SIZE = 1048576; // 1MB

    // List of sensitive/special files to exclude
    const excludeFiles = ['.env', '.gitkeep', '.gitignore', '.DS_Store', 'Thumbs.db'];

    const textFiles = files.filter(file => {
      const fileName = file.path.split('/').pop() || '';

      return (
        file.size <= MAX_FILE_SIZE &&
        !file.path.match(/\.(png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp4|mp3|pdf|zip|tar|gz|pyc|pyo|pyd|so|dylib|dll|exe|bin|dat|db|sqlite|lock)$/i) &&
        !file.path.includes('__pycache__') &&
        !file.path.includes('node_modules') &&
        !file.path.includes('.git/') &&
        !file.path.includes('dist/') &&
        !file.path.includes('build/') &&
        !excludeFiles.includes(fileName) &&
        !fileName.startsWith('.') // Exclude hidden files
      );
    });

    // Load first 100 files to avoid overwhelming the database
    const filesToLoad = textFiles.slice(0, 100);

    // Get existing files to preserve local changes
    const existingFilesResult = await client.query(
      'SELECT file_path, status, current_content FROM project_files WHERE project_id = $1',
      [projectId]
    );

    const existingFiles = new Map(
      existingFilesResult.rows.map(row => [row.file_path, { status: row.status, content: row.current_content }])
    );

    // Delete files that no longer exist in the repo (but keep modified ones)
    const filePaths = filesToLoad.map(f => f.path);
    if (filePaths.length > 0) {
      await client.query(
        `DELETE FROM project_files
         WHERE project_id = $1
         AND file_path NOT IN (${filePaths.map((_, i) => `$${i + 2}`).join(',')})
         AND status = 'unmodified'`,
        [projectId, ...filePaths]
      );
    } else {
      // If repo is empty, delete all unmodified files (keep modified ones for later commit)
      await client.query(
        `DELETE FROM project_files
         WHERE project_id = $1 AND status = 'unmodified'`,
        [projectId]
      );
    }

    // Insert/update files in database
    let loadedCount = 0;
    let failedCount = 0;
    let preservedCount = 0;
    const failedFiles: string[] = [];

    for (const file of filesToLoad) {
      try {
        const content = await fetchGitHubFileContent(token, repoOwner, repoName, file.path, branch);

        const existingFile = existingFiles.get(file.path);

        // If file has local changes, preserve them and update only original_content
        if (existingFile && existingFile.status !== 'unmodified') {
          await client.query(
            `UPDATE project_files
             SET original_content = $1, sha = $2, file_mode = $3, last_modified_at = CURRENT_TIMESTAMP
             WHERE project_id = $4 AND file_path = $5`,
            [content, file.sha, file.mode, projectId, file.path]
          );
          preservedCount++;
        } else {
          // File is unmodified or new, safe to overwrite
          await client.query(
            `INSERT INTO project_files (project_id, file_path, original_content, current_content, sha, file_mode, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'unmodified')
             ON CONFLICT (project_id, file_path)
             DO UPDATE SET original_content = $3, current_content = $4, sha = $5, file_mode = $6, status = 'unmodified', last_modified_at = CURRENT_TIMESTAMP`,
            [projectId, file.path, content, content, file.sha, file.mode]
          );
        }

        loadedCount++;
      } catch (error: any) {
        failedCount++;
        failedFiles.push(file.path);
        console.error(`Failed to load file ${file.path}:`, error?.response?.status || error?.message || 'Unknown error');
        // Continue with other files
      }
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      projectId,
      filesLoaded: loadedCount,
      filesFailed: failedCount,
      filesPreserved: preservedCount,
      failedFiles: failedFiles.length > 0 ? failedFiles.slice(0, 5) : undefined, // Show first 5 failed files
      totalFiles: files.length,
      message: `Loaded ${loadedCount} files from ${repoFullName}${preservedCount > 0 ? ` (preserved ${preservedCount} local changes)` : ''}${failedCount > 0 ? ` (${failedCount} files failed)` : ''}`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error loading project:', error);
    res.status(500).json({ error: 'Failed to load project' });
  } finally {
    client.release();
  }
});

/**
 * GET /api/projects
 * Get all projects for the authenticated user
 */
router.get('/', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const user = req.user as JwtPayload;

  try {
    const result = await pool.query(
      `SELECT
        id,
        repo_owner,
        repo_name,
        repo_full_name,
        default_branch,
        current_branch,
        is_private,
        last_synced_at,
        created_at,
        updated_at,
        (SELECT COUNT(*) FROM project_files WHERE project_id = projects.id) as file_count,
        (SELECT COUNT(*) FROM project_files WHERE project_id = projects.id AND status != 'unmodified') as modified_count
       FROM projects
       WHERE user_id = $1
       ORDER BY updated_at DESC`,
      [user.id]
    );

    res.json({ projects: result.rows });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

/**
 * GET /api/projects/:projectId/tree
 * Get file tree for a project
 */
router.get('/:projectId/tree', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const user = req.user as JwtPayload;
  const { projectId } = req.params;

  try {
    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, user.id]
    );

    if (projectCheck.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Get all files for the project
    const result = await pool.query(
      `SELECT file_path, status, last_modified_at
       FROM project_files
       WHERE project_id = $1
       ORDER BY file_path`,
      [projectId]
    );

    res.json({ tree: result.rows });
  } catch (error) {
    console.error('Error fetching project tree:', error);
    res.status(500).json({ error: 'Failed to fetch project tree' });
  }
});

/**
 * GET /api/projects/:projectId/files/*
 * Get file content from database
 */
router.get('/:projectId/files', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const user = req.user as JwtPayload;
  const { projectId } = req.params;
  const filePath = req.query.path as string;

  if (!filePath) {
    res.status(400).json({ error: 'File path is required' });
    return;
  }

  try {
    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, user.id]
    );

    if (projectCheck.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Get file content
    const result = await pool.query(
      `SELECT file_path, current_content, original_content, status, sha, last_modified_at
       FROM project_files
       WHERE project_id = $1 AND file_path = $2`,
      [projectId, filePath]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    res.json({
      filePath: result.rows[0].file_path,
      content: result.rows[0].current_content,
      originalContent: result.rows[0].original_content,
      status: result.rows[0].status,
      sha: result.rows[0].sha,
      lastModified: result.rows[0].last_modified_at
    });
  } catch (error) {
    console.error('Error fetching file:', error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

/**
 * PUT /api/projects/:projectId/files/*
 * Save file changes locally (upsert - insert if not exists)
 */
router.put('/:projectId/files', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const user = req.user as JwtPayload;
  const { projectId } = req.params;
  const filePath = req.query.path as string;
  const { content } = req.body;

  if (!filePath) {
    res.status(400).json({ error: 'File path is required' });
    return;
  }

  if (content === undefined) {
    res.status(400).json({ error: 'Content is required' });
    return;
  }

  try {
    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, user.id]
    );

    if (projectCheck.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check if file exists in database
    const fileCheck = await pool.query(
      'SELECT original_content FROM project_files WHERE project_id = $1 AND file_path = $2',
      [projectId, filePath]
    );

    let result;

    if (fileCheck.rows.length === 0) {
      // File doesn't exist - insert it (treat current content as original)
      result = await pool.query(
        `INSERT INTO project_files (project_id, file_path, original_content, current_content, status, file_mode)
         VALUES ($1, $2, $3, $4, 'unmodified', '100644')
         RETURNING file_path, status, last_modified_at`,
        [projectId, filePath, content, content]
      );
    } else {
      // File exists - update it
      const originalContent = fileCheck.rows[0].original_content;
      const status = content === originalContent ? 'unmodified' : 'modified';

      result = await pool.query(
        `UPDATE project_files
         SET current_content = $1, status = $2, last_modified_at = CURRENT_TIMESTAMP
         WHERE project_id = $3 AND file_path = $4
         RETURNING file_path, status, last_modified_at`,
        [content, status, projectId, filePath]
      );
    }

    // Check if update/insert was successful
    if (!result || result.rows.length === 0) {
      res.status(500).json({ error: 'Failed to save file to database' });
      return;
    }

    // Update project updated_at
    await pool.query(
      'UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [projectId]
    );

    res.json({
      success: true,
      filePath: result.rows[0].file_path,
      status: result.rows[0].status,
      lastModified: result.rows[0].last_modified_at
    });
  } catch (error) {
    console.error('Error saving file:', error);
    res.status(500).json({ error: 'Failed to save file' });
  }
});

/**
 * GET /api/projects/:projectId/changes
 * Get list of modified files
 */
router.get('/:projectId/changes', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const user = req.user as JwtPayload;
  const { projectId } = req.params;

  try {
    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT repo_full_name, current_branch FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, user.id]
    );

    if (projectCheck.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Get all modified files
    const result = await pool.query(
      `SELECT file_path, status, last_modified_at
       FROM project_files
       WHERE project_id = $1 AND status != 'unmodified'
       ORDER BY last_modified_at DESC`,
      [projectId]
    );

    res.json({
      projectId: parseInt(projectId),
      repoFullName: projectCheck.rows[0].repo_full_name,
      branch: projectCheck.rows[0].current_branch,
      changes: result.rows,
      totalChanges: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching changes:', error);
    res.status(500).json({ error: 'Failed to fetch changes' });
  }
});

/**
 * GET /api/projects/:projectId/diff
 * Get unified diff for all modified files
 */
router.get('/:projectId/diff', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const user = req.user as JwtPayload;
  const { projectId } = req.params;

  try {
    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT repo_full_name, current_branch FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, user.id]
    );

    if (projectCheck.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Get all modified files with both original and current content
    const result = await pool.query(
      `SELECT file_path, original_content, current_content, status
       FROM project_files
       WHERE project_id = $1 AND status != 'unmodified'
       ORDER BY file_path`,
      [projectId]
    );

    // Generate unified diff for each file
    const diffs = result.rows.map(file => {
      const originalLines = (file.original_content || '').split('\n');
      const currentLines = (file.current_content || '').split('\n');

      // Simple line-by-line diff
      const diffLines: string[] = [];
      diffLines.push(`diff --git a/${file.file_path} b/${file.file_path}`);
      diffLines.push(`--- a/${file.file_path}`);
      diffLines.push(`+++ b/${file.file_path}`);

      // Find changed sections
      let i = 0;
      while (i < Math.max(originalLines.length, currentLines.length)) {
        const origLine = originalLines[i] || '';
        const currLine = currentLines[i] || '';

        if (origLine !== currLine) {
          // Start of a change block
          const contextStart = Math.max(0, i - 3);
          const changeStart = i;

          // Find end of change block
          let changeEnd = i;
          while (changeEnd < Math.max(originalLines.length, currentLines.length) &&
                 (originalLines[changeEnd] || '') !== (currentLines[changeEnd] || '')) {
            changeEnd++;
          }

          const contextEnd = Math.min(Math.max(originalLines.length, currentLines.length), changeEnd + 3);

          // Generate hunk header
          diffLines.push(`@@ -${contextStart + 1},${contextEnd - contextStart} +${contextStart + 1},${contextEnd - contextStart} @@`);

          // Add context and changes
          for (let j = contextStart; j < contextEnd; j++) {
            if (j < changeStart || j >= changeEnd) {
              // Context line
              diffLines.push(` ${originalLines[j] || currentLines[j] || ''}`);
            } else {
              // Changed lines
              if (j < originalLines.length && originalLines[j] !== (currentLines[j] || '')) {
                diffLines.push(`-${originalLines[j]}`);
              }
              if (j < currentLines.length && currentLines[j] !== (originalLines[j] || '')) {
                diffLines.push(`+${currentLines[j]}`);
              }
            }
          }

          i = changeEnd;
        } else {
          i++;
        }
      }

      return {
        filePath: file.file_path,
        status: file.status,
        diff: diffLines.join('\n'),
        originalContent: file.original_content,
        currentContent: file.current_content
      };
    });

    res.json({
      projectId: parseInt(projectId),
      repoFullName: projectCheck.rows[0].repo_full_name,
      branch: projectCheck.rows[0].current_branch,
      diffs,
      totalFiles: diffs.length
    });
  } catch (error) {
    console.error('Error generating diff:', error);
    res.status(500).json({ error: 'Failed to generate diff' });
  }
});

/**
 * GET /api/projects/:projectId/files/diff
 * Get diff for a specific file
 */
router.get('/:projectId/files/diff', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const user = req.user as JwtPayload;
  const { projectId } = req.params;
  const filePath = req.query.path as string;

  if (!filePath) {
    res.status(400).json({ error: 'File path is required' });
    return;
  }

  try {
    // Verify project belongs to user
    const projectCheck = await pool.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, user.id]
    );

    if (projectCheck.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Get file content
    const result = await pool.query(
      `SELECT file_path, original_content, current_content, status
       FROM project_files
       WHERE project_id = $1 AND file_path = $2`,
      [projectId, filePath]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const file = result.rows[0];

    res.json({
      filePath: file.file_path,
      status: file.status,
      originalContent: file.original_content,
      currentContent: file.current_content
    });
  } catch (error) {
    console.error('Error fetching file diff:', error);
    res.status(500).json({ error: 'Failed to fetch file diff' });
  }
});

/**
 * POST /api/projects/:projectId/commit
 * Commit changes to GitHub
 */
router.post('/:projectId/commit', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  const user = req.user as JwtPayload;
  const { projectId } = req.params;
  const { message, fileSelections } = req.body;

  if (!message || !message.trim()) {
    res.status(400).json({ error: 'Commit message is required' });
    return;
  }

  if (!fileSelections || !Array.isArray(fileSelections) || fileSelections.length === 0) {
    res.status(400).json({ error: 'At least one file must be selected' });
    return;
  }

  try {
    // Verify project belongs to user and get project info
    const projectResult = await pool.query(
      'SELECT repo_owner, repo_name, repo_full_name, current_branch FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, user.id]
    );

    if (projectResult.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const project = projectResult.rows[0];

    // Get GitHub token
    const token = await getGitHubToken(user.id);

    // Get changed files that were selected
    const filesResult = await pool.query(
      `SELECT file_path, current_content, file_mode, sha
       FROM project_files
       WHERE project_id = $1 AND file_path = ANY($2) AND status != 'unmodified'`,
      [projectId, fileSelections]
    );

    const files = filesResult.rows;

    if (files.length === 0) {
      res.status(400).json({ error: 'No modified files found to commit' });
      return;
    }

    // Step 1: Get the current commit SHA of the branch
    const refResponse = await axios.get(
      `https://api.github.com/repos/${project.repo_owner}/${project.repo_name}/git/refs/heads/${project.current_branch}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    const currentCommitSha = refResponse.data.object.sha;

    // Step 2: Get the tree SHA from current commit
    const commitResponse = await axios.get(
      `https://api.github.com/repos/${project.repo_owner}/${project.repo_name}/git/commits/${currentCommitSha}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    const baseTreeSha = commitResponse.data.tree.sha;

    // Step 3: Create blobs for each file
    const treeItems = [];
    for (const file of files) {
      const blobResponse = await axios.post(
        `https://api.github.com/repos/${project.repo_owner}/${project.repo_name}/git/blobs`,
        {
          content: file.current_content,
          encoding: 'utf-8'
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      treeItems.push({
        path: file.file_path,
        mode: file.file_mode || '100644',
        type: 'blob',
        sha: blobResponse.data.sha
      });
    }

    // Step 4: Create new tree
    const treeResponse = await axios.post(
      `https://api.github.com/repos/${project.repo_owner}/${project.repo_name}/git/trees`,
      {
        base_tree: baseTreeSha,
        tree: treeItems
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    const newTreeSha = treeResponse.data.sha;

    // Step 5: Create commit
    const newCommitResponse = await axios.post(
      `https://api.github.com/repos/${project.repo_owner}/${project.repo_name}/git/commits`,
      {
        message,
        tree: newTreeSha,
        parents: [currentCommitSha]
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );
    const newCommitSha = newCommitResponse.data.sha;

    // Step 6: Update branch reference
    await axios.patch(
      `https://api.github.com/repos/${project.repo_owner}/${project.repo_name}/git/refs/heads/${project.current_branch}`,
      { sha: newCommitSha },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    // Step 7: Update database - mark files as committed
    await pool.query(
      `UPDATE project_files
       SET status = 'unmodified',
           original_content = current_content,
           sha = $1
       WHERE project_id = $2 AND file_path = ANY($3)`,
      [newCommitSha, projectId, fileSelections]
    );

    // Save commit to database
    await pool.query(
      `INSERT INTO project_commits (project_id, commit_sha, author_name, author_email, commit_message, committed_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)`,
      [projectId, newCommitSha, user.email || 'Unknown', user.email || '', message]
    );

    res.json({
      success: true,
      commitSha: newCommitSha,
      filesCommitted: files.length,
      message: 'Successfully committed and pushed to GitHub'
    });

  } catch (error: any) {
    console.error('Commit error:', error);
    const errorMessage = error?.response?.data?.message || error?.message || 'Failed to create commit';
    res.status(500).json({ error: 'Failed to create commit', details: errorMessage });
  }
});

export default router;
