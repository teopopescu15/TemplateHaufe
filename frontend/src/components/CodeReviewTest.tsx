/**
 * Test component to verify Code Review integration
 * This can be removed after Phase 5 implementation
 */

import { useCodeReview } from '../hooks/useCodeReview';

export const CodeReviewTest = ({ projectId }: { projectId: number }) => {
  const {
    issues,
    stats,
    loading,
    reviewing,
    error,
    healthStatus,
    triggerReview,
    loadIssues,
    checkHealth,
  } = useCodeReview({ projectId, autoLoad: false });

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h2>Code Review Test Component</h2>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={checkHealth} disabled={loading}>
          Check Health
        </button>
        <button onClick={() => loadIssues()} disabled={loading} style={{ marginLeft: '10px' }}>
          Load Issues
        </button>
        <button
          onClick={() =>
            triggerReview({
              config: {
                enabledGuidelines: ['eslint'],
                enabledDimensions: ['security', 'linting'],
                modelName: 'gpt-oss:120b-cloud',
              },
            })
          }
          disabled={reviewing}
          style={{ marginLeft: '10px' }}
        >
          {reviewing ? 'Reviewing...' : 'Trigger Review'}
        </button>
      </div>

      <div>
        <h3>Health Status</h3>
        <p>Checked: {healthStatus.checked ? 'Yes' : 'No'}</p>
        <p>Ollama Available: {healthStatus.ollamaAvailable ? '✅' : '❌'}</p>
        <p>Model Available: {healthStatus.modelAvailable ? '✅' : '❌'}</p>
      </div>

      <div>
        <h3>Statistics</h3>
        <p>Total Issues: {stats.total}</p>
        <p>Active: {stats.active}</p>
        <p>Resolved: {stats.resolved}</p>
        <p>Errors: {stats.bySeverity.error}</p>
        <p>Warnings: {stats.bySeverity.warning}</p>
        <p>Info: {stats.bySeverity.info}</p>
      </div>

      <div>
        <h3>Issues ({issues.length})</h3>
        {loading && <p>Loading...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {issues.slice(0, 5).map((issue) => (
          <div
            key={issue.id}
            style={{
              padding: '10px',
              margin: '5px 0',
              border: '1px solid #ddd',
              borderRadius: '4px',
            }}
          >
            <strong>
              [{issue.severity.toUpperCase()}] {issue.title}
            </strong>
            <p style={{ margin: '5px 0', fontSize: '14px' }}>
              {issue.filePath}:{issue.lineNumber}
            </p>
            <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>{issue.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
