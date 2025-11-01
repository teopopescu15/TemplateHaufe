import React, { useState, useEffect } from 'react';
import { Github, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

interface GitHubStatus {
  connected: boolean;
  username?: string;
  connectedAt?: string;
}

export const GitHubConnect: React.FC = () => {
  const [status, setStatus] = useState<GitHubStatus>({ connected: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();

    // Check for OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('github') === 'connected') {
      checkStatus();
      // Clean URL
      window.history.replaceState({}, '', '/monaco-editor');
    }
  }, []);

  const checkStatus = async () => {
    try {
      const response = await api.get('/github/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Failed to check GitHub status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await api.get('/github/auth');
      window.location.href = response.data.authUrl;
    } catch (error) {
      console.error('Failed to initiate GitHub OAuth:', error);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect GitHub?')) return;

    try {
      await api.post('/github/disconnect');
      setStatus({ connected: false });
    } catch (error) {
      console.error('Failed to disconnect GitHub:', error);
    }
  };

  if (loading) {
    return <div className="text-slate-400 text-sm">Loading...</div>;
  }

  if (status.connected) {
    return (
      <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg">
        <Github className="w-4 h-4 text-green-400" />
        <span className="text-sm text-slate-200 max-w-[100px] md:max-w-none truncate">{status.username}</span>
        <Check className="w-4 h-4 text-green-400" />
        <Button
          onClick={handleDisconnect}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-red-400 ml-1 md:ml-2 p-1"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      variant="outline"
      size="sm"
      className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white w-full md:w-auto"
    >
      <Github className="w-4 h-4 mr-2" />
      <span className="hidden sm:inline">Connect GitHub</span>
      <span className="sm:hidden">Connect</span>
    </Button>
  );
};

export default GitHubConnect;
