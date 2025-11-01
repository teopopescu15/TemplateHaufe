import express from 'express';
import axios from 'axios';
import { authenticateToken } from '../middleware/auth';
import { encryptToken, decryptToken } from '../utils/encryption';
import { JwtPayload } from '../services/jwtService';
import pool from '../config/database';

const router = express.Router();

// Helper to get GitHub token
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

// Step 1: Redirect to GitHub OAuth
router.get('/auth', authenticateToken, (req, res): void => {
  const user = req.user as JwtPayload;
  const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${process.env.GITHUB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.GITHUB_CALLBACK_URL!)}&` +
    `scope=repo user:email&` +
    `state=${user.id}`;  // Use userId as state for verification

  res.json({ authUrl: githubAuthUrl });
});

// Step 2: GitHub OAuth Callback
router.get('/callback', async (req, res): Promise<void> => {
  const { code, state } = req.query;

  if (!code || !state) {
    res.status(400).json({ error: 'Missing code or state' });
    return;
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code as string,
        redirect_uri: process.env.GITHUB_CALLBACK_URL
      },
      {
        headers: { Accept: 'application/json' }
      }
    );

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      throw new Error('No access token received from GitHub');
    }

    // Get GitHub user info
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    const { login, id: github_user_id } = userResponse.data;

    // Encrypt and store token
    const encryptedToken = encryptToken(access_token);
    const userId = parseInt(state as string);

    await pool.query(
      `UPDATE users
       SET github_token = $1,
           github_username = $2,
           github_user_id = $3,
           github_connected_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [encryptedToken, login, github_user_id, userId]
    );

    // Redirect to frontend success page
    res.redirect(`${process.env.FRONTEND_URL}/monaco-editor?github=connected`);

  } catch (error) {
    console.error('GitHub OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/monaco-editor?github=error`);
  }
});

// Check GitHub connection status
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = req.user as JwtPayload;
    const result = await pool.query(
      'SELECT github_username, github_connected_at FROM users WHERE id = $1',
      [user.id]
    );

    const userData = result.rows[0];

    res.json({
      connected: !!userData.github_username,
      username: userData.github_username,
      connectedAt: userData.github_connected_at
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check GitHub status' });
  }
});

// Disconnect GitHub
router.post('/disconnect', authenticateToken, async (req, res) => {
  try {
    const user = req.user as JwtPayload;
    await pool.query(
      `UPDATE users
       SET github_token = NULL,
           github_username = NULL,
           github_user_id = NULL,
           github_connected_at = NULL
       WHERE id = $1`,
      [user.id]
    );

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect GitHub' });
  }
});

// List user's repositories
router.get('/repos', authenticateToken, async (req, res) => {
  try {
    const user = req.user as JwtPayload;
    const token = await getGitHubToken(user.id);

    const response = await axios.get('https://api.github.com/user/repos', {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        sort: 'updated',
        per_page: 100,
        affiliation: 'owner,collaborator'
      }
    });

    const repos = response.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: repo.owner.login,
      private: repo.private,
      defaultBranch: repo.default_branch,
      description: repo.description,
      updatedAt: repo.updated_at
    }));

    res.json({ repos });
  } catch (error: any) {
    console.error('Get repos error:', error);
    res.status(500).json({ error: 'Failed to fetch repositories', details: error.message });
  }
});

// Get repository branches
router.get('/repos/:owner/:repo/branches', authenticateToken, async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const user = req.user as JwtPayload;
    const token = await getGitHubToken(user.id);

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/branches`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const branches = response.data.map((branch: any) => ({
      name: branch.name,
      sha: branch.commit.sha,
      protected: branch.protected
    }));

    res.json({ branches });
  } catch (error: any) {
    console.error('Get branches error:', error);
    res.status(500).json({ error: 'Failed to fetch branches', details: error.message });
  }
});

// Get repository file tree
router.get('/repos/:owner/:repo/tree/:branch', authenticateToken, async (req, res) => {
  try {
    const { owner, repo, branch } = req.params;
    const user = req.user as JwtPayload;
    const token = await getGitHubToken(user.id);

    // Get tree recursively
    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const tree = response.data.tree
      .filter((item: any) => item.type === 'blob')  // Only files, not trees
      .map((item: any) => ({
        path: item.path,
        sha: item.sha,
        size: item.size,
        mode: item.mode
      }));

    res.json({ tree, sha: response.data.sha });
  } catch (error: any) {
    console.error('Get tree error:', error?.response?.data || error?.message);

    // Handle specific GitHub API errors
    if (error?.response?.status === 404) {
      const message = error?.response?.data?.message || 'Repository, branch, or tree not found';
      res.status(404).json({
        error: message,
        isEmpty: message.includes('empty'),
        suggestion: message.includes('empty') ? 'This repository appears to be empty. Try a different repository or branch.' : 'Branch may not exist. Try checking the default branch.'
      });
      return;
    }

    if (error?.response?.status === 409) {
      res.status(409).json({
        error: 'Repository is empty',
        isEmpty: true,
        suggestion: 'This repository has no commits yet. Add some files and try again.'
      });
      return;
    }

    res.status(500).json({ error: 'Failed to fetch repository tree', details: error?.message });
  }
});

// Get file content - using query parameter for file path
router.get('/repos/:owner/:repo/contents', authenticateToken, async (req, res): Promise<void> => {
  try {
    const { owner, repo } = req.params;
    const filePath = req.query.path as string;
    const branch = req.query.ref as string || 'main';
    const user = req.user as JwtPayload;
    const token = await getGitHubToken(user.id);

    if (!filePath) {
      res.status(400).json({ error: 'File path is required as query parameter' });
      return;
    }

    const response = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { ref: branch }
      }
    );

    const { content, encoding, sha, size } = response.data;

    // Decode base64 content
    const decodedContent = encoding === 'base64'
      ? Buffer.from(content, 'base64').toString('utf-8')
      : content;

    res.json({
      content: decodedContent,
      sha,
      size,
      path: filePath
    });
  } catch (error: any) {
    console.error('Get file error:', error);
    res.status(404).json({ error: 'File not found', details: error.message });
  }
});

// Create Pull Request
router.post('/repos/:owner/:repo/pulls', authenticateToken, async (req, res) => {
  const { owner, repo } = req.params;
  const { title, body, head, base } = req.body;

  try {
    const user = req.user as JwtPayload;
    const token = await getGitHubToken(user.id);

    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      { title, body, head, base },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json({
      success: true,
      prNumber: response.data.number,
      prUrl: response.data.html_url
    });

  } catch (error: any) {
    console.error('Create PR error:', error);
    res.status(500).json({ error: 'Failed to create pull request', details: error.message });
  }
});

export default router;
