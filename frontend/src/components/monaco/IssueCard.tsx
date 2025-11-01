import React, { useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { CodeIssue } from '@/types/codeReview';
import { CommentSection } from './CommentSection';

interface IssueCardProps {
  issue: CodeIssue;
  onJumpToCode: (issue: CodeIssue) => void;
  onResolve: (issueId: string) => void;
  onDismiss: (issueId: string) => void;
}

/**
 * Card component for displaying individual code issues
 * Shows issue details with expand/collapse functionality
 */
export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onJumpToCode,
  onResolve,
  onDismiss,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Determine severity styling
  const getSeverityConfig = () => {
    switch (issue.severity) {
      case 'error':
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          color: 'text-red-500',
          bgColor: 'bg-red-900/20',
          borderColor: 'border-red-700',
          badgeVariant: 'destructive' as const,
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-4 h-4" />,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-900/20',
          borderColor: 'border-yellow-700',
          badgeVariant: 'default' as const,
        };
      case 'info':
        return {
          icon: <Info className="w-4 h-4" />,
          color: 'text-blue-500',
          bgColor: 'bg-blue-900/20',
          borderColor: 'border-blue-700',
          badgeVariant: 'outline' as const,
        };
    }
  };

  const { icon, color, bgColor, borderColor, badgeVariant } = getSeverityConfig();

  // Category emoji mapping
  const getCategoryEmoji = () => {
    switch (issue.category) {
      case 'security':
        return '🔒';
      case 'architecture':
        return '🏗️';
      case 'linting':
        return '✨';
      case 'testing':
        return '🧪';
      case 'performance':
        return '⚡';
      default:
        return '📋';
    }
  };

  return (
    <div
      className={`p-3 rounded-lg border ${borderColor} ${bgColor} transition-all duration-200 hover:shadow-md`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={color}>{icon}</span>
            <h4 className="font-semibold text-sm text-white">{issue.title}</h4>
            {issue.wasResolvedBefore && (
              <Badge
                variant="outline"
                className="text-xs bg-orange-900/30 text-orange-400 border-orange-700"
                title={`Reappeared (resolved ${issue.resolutionCount} time(s) before)`}
              >
                <RotateCcw className="w-3 h-3 mr-1" />
                Reappeared
              </Badge>
            )}
          </div>

          {/* File location */}
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-2">
            <span className="font-mono">{issue.filePath}</span>
            <span>:</span>
            <span className="font-mono">{issue.lineNumber}</span>
            {issue.columnNumber && (
              <>
                <span>:</span>
                <span className="font-mono">{issue.columnNumber}</span>
              </>
            )}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mb-2">
            <Badge variant={badgeVariant} className="text-xs">
              {issue.severity.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs bg-slate-800 border-slate-700">
              {getCategoryEmoji()} {issue.category}
            </Badge>
            {issue.isManual && (
              <Badge variant="outline" className="text-xs bg-purple-900/30 border-purple-700">
                Manual
              </Badge>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            onClick={() => onJumpToCode(issue)}
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-purple-400 hover:text-purple-300 hover:bg-purple-900/30"
            title="Jump to code"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setExpanded(!expanded)}
            size="sm"
            variant="ghost"
            className="h-7 px-2 hover:bg-slate-700"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-700 space-y-3">
          {/* Description */}
          <div>
            <p className="text-xs font-semibold text-slate-300 mb-1">Description:</p>
            <p className="text-xs text-slate-400">{issue.description}</p>
          </div>

          {/* Code snippet */}
          {issue.codeSnippet && (
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-1">Code:</p>
              <pre className="text-xs bg-slate-950 p-2 rounded border border-slate-700 overflow-x-auto">
                <code className="text-slate-300">{issue.codeSnippet}</code>
              </pre>
            </div>
          )}

          {/* Suggestion */}
          {issue.suggestion && (
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-1">Suggestion:</p>
              <p className="text-xs text-slate-400">{issue.suggestion}</p>
            </div>
          )}

          {/* Suggested fix */}
          {issue.suggestedFix && (
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-1">Suggested Fix:</p>
              <pre className="text-xs bg-slate-950 p-2 rounded border border-slate-700 overflow-x-auto">
                <code className="text-green-400">{issue.suggestedFix}</code>
              </pre>
            </div>
          )}

          {/* Metadata */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>Rule: {issue.ruleId}</span>
            <span>•</span>
            <span>First seen: {new Date(issue.firstDetectedAt).toLocaleDateString()}</span>
          </div>

          {/* Comments section */}
          <div className="border-t border-slate-700 pt-3 mt-3">
            <CommentSection issueId={issue.id} />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={() => onResolve(issue.id)}
              size="sm"
              variant="outline"
              className="bg-green-900/20 border-green-700 hover:bg-green-900/30 text-green-400"
            >
              <Check className="w-3 h-3 mr-1" />
              Resolve
            </Button>
            <Button
              onClick={() => onDismiss(issue.id)}
              size="sm"
              variant="outline"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300"
            >
              <X className="w-3 h-3 mr-1" />
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
