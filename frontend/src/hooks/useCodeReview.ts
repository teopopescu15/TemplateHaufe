import { useState, useCallback, useEffect } from 'react';
import { codeReviewApi } from '../services/codeReviewApi';
import type {
  CodeIssue,
  ReviewConfig,
  ReviewHistory,
  TriggerReviewRequest,
  CreateIssueRequest,
  UpdateIssueRequest,
  ReviewConfigInput,
  IssueFilterOptions,
  IssueStats,
} from '../types/codeReview';

interface UseCodeReviewOptions {
  projectId: number;
  autoLoad?: boolean;
}

interface UseCodeReviewReturn {
  // State
  issues: CodeIssue[];
  config: ReviewConfig | null;
  history: ReviewHistory[];
  stats: IssueStats;
  loading: boolean;
  reviewing: boolean;
  error: string | null;
  healthStatus: {
    ollamaAvailable: boolean;
    modelAvailable: boolean;
    checked: boolean;
  };

  // Actions
  triggerReview: (request: Omit<TriggerReviewRequest, 'projectId'>) => Promise<void>;
  loadIssues: (filters?: Omit<IssueFilterOptions, 'projectId'>) => Promise<void>;
  createIssue: (issue: Omit<CreateIssueRequest, 'projectId'>) => Promise<void>;
  updateIssue: (issueId: string, updates: UpdateIssueRequest) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
  resolveIssue: (issueId: string) => Promise<void>;
  dismissIssue: (issueId: string) => Promise<void>;
  loadConfig: () => Promise<void>;
  saveConfig: (config: Omit<ReviewConfigInput, 'projectId'>) => Promise<void>;
  loadHistory: (limit?: number) => Promise<void>;
  checkHealth: () => Promise<void>;
  clearError: () => void;
}

/**
 * Custom hook for managing code review state and operations
 */
export const useCodeReview = ({
  projectId,
  autoLoad = false,
}: UseCodeReviewOptions): UseCodeReviewReturn => {
  // State
  const [issues, setIssues] = useState<CodeIssue[]>([]);
  const [config, setConfig] = useState<ReviewConfig | null>(null);
  const [history, setHistory] = useState<ReviewHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState({
    ollamaAvailable: false,
    modelAvailable: false,
    checked: false,
  });

  // Compute statistics from issues
  const stats: IssueStats = {
    total: issues.length,
    active: issues.filter((i) => i.status === 'active').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
    dismissed: issues.filter((i) => i.status === 'dismissed').length,
    bySeverity: {
      error: issues.filter((i) => i.severity === 'error').length,
      warning: issues.filter((i) => i.severity === 'warning').length,
      info: issues.filter((i) => i.severity === 'info').length,
    },
    byCategory: {
      security: issues.filter((i) => i.category === 'security').length,
      architecture: issues.filter((i) => i.category === 'architecture').length,
      linting: issues.filter((i) => i.category === 'linting').length,
      testing: issues.filter((i) => i.category === 'testing').length,
      performance: issues.filter((i) => i.category === 'performance').length,
    },
    reappeared: issues.filter((i) => i.wasResolvedBefore).length,
  };

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const triggerReview = useCallback(
    async (request: Omit<TriggerReviewRequest, 'projectId'>) => {
      setReviewing(true);
      setError(null);
      try {
        const result = await codeReviewApi.triggerReview({
          projectId,
          ...request,
        });

        if (result.success) {
          // Reload issues to get the latest
          await loadIssues();
        } else {
          setError(result.error || 'Review failed');
        }
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to trigger review');
      } finally {
        setReviewing(false);
      }
    },
    [projectId]
  );

  const loadIssues = useCallback(
    async (filters?: Omit<IssueFilterOptions, 'projectId'>) => {
      setLoading(true);
      setError(null);
      try {
        const loadedIssues = await codeReviewApi.getIssues(projectId, filters);
        setIssues(loadedIssues);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to load issues');
      } finally {
        setLoading(false);
      }
    },
    [projectId]
  );

  const createIssue = useCallback(
    async (issue: Omit<CreateIssueRequest, 'projectId'>) => {
      setError(null);
      try {
        const newIssue = await codeReviewApi.createIssue({
          projectId,
          ...issue,
        });
        setIssues((prev) => [newIssue, ...prev]);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to create issue');
        throw err;
      }
    },
    [projectId]
  );

  const updateIssue = useCallback(async (issueId: string, updates: UpdateIssueRequest) => {
    setError(null);
    try {
      const updated = await codeReviewApi.updateIssue(issueId, updates);
      setIssues((prev) => prev.map((issue) => (issue.id === issueId ? updated : issue)));
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update issue');
      throw err;
    }
  }, []);

  const deleteIssue = useCallback(async (issueId: string) => {
    setError(null);
    try {
      await codeReviewApi.deleteIssue(issueId);
      setIssues((prev) => prev.filter((issue) => issue.id !== issueId));
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete issue');
      throw err;
    }
  }, []);

  const resolveIssue = useCallback(async (issueId: string) => {
    setError(null);
    try {
      const resolved = await codeReviewApi.resolveIssue(issueId);
      setIssues((prev) => prev.map((issue) => (issue.id === issueId ? resolved : issue)));
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to resolve issue');
      throw err;
    }
  }, []);

  const dismissIssue = useCallback(async (issueId: string) => {
    setError(null);
    try {
      const dismissed = await codeReviewApi.dismissIssue(issueId);
      setIssues((prev) => prev.map((issue) => (issue.id === issueId ? dismissed : issue)));
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to dismiss issue');
      throw err;
    }
  }, []);

  const loadConfig = useCallback(async () => {
    setError(null);
    try {
      const loadedConfig = await codeReviewApi.getConfig(projectId);
      setConfig(loadedConfig);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to load configuration');
    }
  }, [projectId]);

  const saveConfig = useCallback(
    async (configData: Omit<ReviewConfigInput, 'projectId'>) => {
      setError(null);
      try {
        const savedConfig = await codeReviewApi.saveConfig({
          projectId,
          ...configData,
        });
        setConfig(savedConfig);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to save configuration');
        throw err;
      }
    },
    [projectId]
  );

  const loadHistory = useCallback(
    async (limit: number = 10) => {
      setError(null);
      try {
        const loadedHistory = await codeReviewApi.getHistory(projectId, limit);
        setHistory(loadedHistory);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || 'Failed to load history');
      }
    },
    [projectId]
  );

  const checkHealth = useCallback(async () => {
    try {
      const health = await codeReviewApi.checkHealth();
      setHealthStatus({
        ollamaAvailable: health.ollamaAvailable,
        modelAvailable: health.modelAvailable,
        checked: true,
      });
    } catch (err: any) {
      setHealthStatus({
        ollamaAvailable: false,
        modelAvailable: false,
        checked: true,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad && projectId) {
      loadIssues();
      loadConfig();
      checkHealth();
    }
  }, [autoLoad, projectId]);

  return {
    // State
    issues,
    config,
    history,
    stats,
    loading,
    reviewing,
    error,
    healthStatus,

    // Actions
    triggerReview,
    loadIssues,
    createIssue,
    updateIssue,
    deleteIssue,
    resolveIssue,
    dismissIssue,
    loadConfig,
    saveConfig,
    loadHistory,
    checkHealth,
    clearError,
  };
};
