import React, { useState, useMemo } from 'react';
import { Filter, RefreshCw, FileText, ArrowUpDown, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { IssueCard } from './IssueCard';
import type { CodeIssue, IssueStats, IssueSeverity, IssueCategory, IssueStatus } from '@/types/codeReview';
import { detectLanguage, getLanguageIcon, getShortFileName } from '@/utils/fileLanguage';

interface IssuesPanelProps {
  open: boolean;
  onClose: () => void;
  issues: CodeIssue[];
  stats: IssueStats;
  onJumpToCode: (issue: CodeIssue) => void;
  onResolve: (issueId: string) => void;
  onDismiss: (issueId: string) => void;
  onRefresh: () => void;
  loading: boolean;
}

/**
 * Responsive modal for displaying and managing code review issues
 * Uses Dialog component - full-screen on mobile, centered wide modal on desktop
 */
export const IssuesPanel: React.FC<IssuesPanelProps> = ({
  open,
  onClose,
  issues,
  stats,
  onJumpToCode,
  onResolve,
  onDismiss,
  onRefresh,
  loading,
}) => {
  // Filter state
  const [severityFilter, setSeverityFilter] = useState<IssueSeverity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IssueCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<IssueStatus | 'all'>('active');
  const [fileFilter, setFileFilter] = useState<string | 'all'>('all');

  // Sort state
  const [sortBy, setSortBy] = useState<'severity' | 'line' | 'date'>('severity');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Filter issues based on selected filters
  const filteredIssues = issues.filter((issue) => {
    if (severityFilter !== 'all' && issue.severity !== severityFilter) return false;
    if (categoryFilter !== 'all' && issue.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && issue.status !== statusFilter) return false;
    if (fileFilter !== 'all' && issue.filePath !== fileFilter) return false;
    return true;
  });

  // Calculate file issue counts for the file filter dropdown
  const fileIssueCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredIssues.forEach((issue) => {
      counts[issue.filePath] = (counts[issue.filePath] || 0) + 1;
    });
    return counts;
  }, [filteredIssues]);

  // Sort files by issue count (descending)
  const sortedFiles = useMemo(() => {
    return Object.entries(fileIssueCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([file, count]) => ({ file, count }));
  }, [fileIssueCounts]);

  // Group issues by file
  const issuesByFile = filteredIssues.reduce((acc, issue) => {
    if (!acc[issue.filePath]) {
      acc[issue.filePath] = [];
    }
    acc[issue.filePath].push(issue);
    return acc;
  }, {} as Record<string, CodeIssue[]>);

  // Calculate severity breakdown per file
  const fileStats = useMemo(() => {
    const stats: Record<string, { error: number; warning: number; info: number }> = {};

    Object.entries(issuesByFile).forEach(([filePath, fileIssues]) => {
      stats[filePath] = {
        error: fileIssues.filter((i) => i.severity === 'error').length,
        warning: fileIssues.filter((i) => i.severity === 'warning').length,
        info: fileIssues.filter((i) => i.severity === 'info').length,
      };
    });

    return stats;
  }, [issuesByFile]);

  // Sort issues within each file
  const sortedIssuesByFile = useMemo(() => {
    const sorted: Record<string, CodeIssue[]> = {};

    Object.entries(issuesByFile).forEach(([filePath, fileIssues]) => {
      sorted[filePath] = [...fileIssues].sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'severity':
            const severityOrder = { error: 3, warning: 2, info: 1 };
            comparison = severityOrder[b.severity] - severityOrder[a.severity];
            break;
          case 'line':
            comparison = a.lineNumber - b.lineNumber;
            break;
          case 'date':
            comparison = new Date(b.firstDetectedAt).getTime() - new Date(a.firstDetectedAt).getTime();
            break;
        }

        return sortDirection === 'asc' ? -comparison : comparison;
      });
    });

    return sorted;
  }, [issuesByFile, sortBy, sortDirection]);

  // Reset all filters
  const resetFilters = () => {
    setSeverityFilter('all');
    setCategoryFilter('all');
    setStatusFilter('active');
    setFileFilter('all');
  };

  // Count active filters
  const activeFilterCount = [
    statusFilter !== 'active',
    severityFilter !== 'all',
    categoryFilter !== 'all',
    fileFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className="w-full h-full sm:w-[90vw] sm:max-w-7xl sm:h-[90vh] sm:rounded-lg bg-slate-900 text-white border-slate-700 p-0 overflow-hidden"
      >
        <DialogHeader className="px-4 sm:px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg sm:text-xl font-bold flex items-center">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-400" />
              Code Issues
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button
                  onClick={resetFilters}
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-800 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              )}
              <Button
                onClick={onRefresh}
                variant="ghost"
                size="sm"
                disabled={loading}
                className="hover:bg-slate-800"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <DialogDescription className="text-slate-400 text-sm">
            Review and manage AI-detected code issues
          </DialogDescription>
        </DialogHeader>

        {/* Statistics */}
        <div className="px-4 sm:px-6 py-4 bg-slate-800/50 border-b border-slate-700">
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{stats.active}</p>
              <p className="text-xs text-slate-400">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">{stats.resolved}</p>
              <p className="text-xs text-slate-400">Resolved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-400">{stats.reappeared}</p>
              <p className="text-xs text-slate-400">Reappeared</p>
            </div>
          </div>

          {/* Severity breakdown */}
          <div className="flex items-center justify-center gap-3 mt-3 pt-3 border-t border-slate-700">
            <Badge variant="destructive" className="text-xs">
              {stats.bySeverity.error} Errors
            </Badge>
            <Badge className="text-xs bg-yellow-600 hover:bg-yellow-700">
              {stats.bySeverity.warning} Warnings
            </Badge>
            <Badge variant="outline" className="text-xs bg-blue-600 border-blue-500">
              {stats.bySeverity.info} Info
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-6 py-3 bg-slate-800/30 border-b border-slate-700">
          <div className="space-y-3">
            {/* Filter controls */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:block flex-shrink-0" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as IssueStatus | 'all')}>
                  <SelectTrigger className="h-9 w-full bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="dismissed">Dismissed</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={severityFilter} onValueChange={(value) => setSeverityFilter(value as IssueSeverity | 'all')}>
                  <SelectTrigger className="h-9 w-full bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as IssueCategory | 'all')}>
                  <SelectTrigger className="h-9 w-full bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="security">🔒 Security</SelectItem>
                    <SelectItem value="architecture">🏗️ Architecture</SelectItem>
                    <SelectItem value="linting">✨ Linting</SelectItem>
                    <SelectItem value="testing">🧪 Testing</SelectItem>
                    <SelectItem value="performance">⚡ Performance</SelectItem>
                    <SelectItem value="documentation">📚 Documentation</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={fileFilter} onValueChange={setFileFilter}>
                  <SelectTrigger className="h-9 w-full bg-slate-800 border-slate-700">
                    <SelectValue placeholder="All Files" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Files</SelectItem>
                    {sortedFiles.map(({ file, count }) => (
                      <SelectItem key={file} value={file}>
                        <span className="font-mono text-xs">
                          {getShortFileName(file)} ({count})
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:block flex-shrink-0" />
              <div className="flex items-center gap-2 flex-1">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'severity' | 'line' | 'date')}>
                  <SelectTrigger className="h-9 w-full sm:w-[180px] bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="severity">Sort by Severity</SelectItem>
                    <SelectItem value="line">Sort by Line Number</SelectItem>
                    <SelectItem value="date">Sort by Date Detected</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))}
                  className="h-9 px-3 bg-slate-800 border-slate-700 hover:bg-slate-700"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? '↑ Asc' : '↓ Desc'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Issues list */}
        <ScrollArea className="h-[calc(100vh-430px)] sm:h-[calc(90vh-340px)] px-4 sm:px-6 py-4">
          {filteredIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-slate-400">
                {issues.length === 0 ? 'No issues found' : 'No issues match your filters'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(sortedIssuesByFile).map(([filePath, fileIssues]) => {
                const language = detectLanguage(filePath);
                const icon = getLanguageIcon(language);
                const stats = fileStats[filePath];

                return (
                  <div key={filePath}>
                    {/* Enhanced file header */}
                    <div className="flex items-center justify-between px-4 py-3 mb-3 bg-slate-800 rounded-lg border border-slate-700">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-lg flex-shrink-0" title={language}>
                          {icon}
                        </span>
                        <span className="font-mono text-sm text-slate-300 truncate" title={filePath}>
                          {filePath}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        {stats.error > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {stats.error}
                          </Badge>
                        )}
                        {stats.warning > 0 && (
                          <Badge className="bg-yellow-600 hover:bg-yellow-700 text-xs">
                            {stats.warning}
                          </Badge>
                        )}
                        {stats.info > 0 && (
                          <Badge variant="outline" className="bg-blue-600 border-blue-500 text-xs">
                            {stats.info}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Issues in this file */}
                    <div className="space-y-2">
                      {fileIssues.map((issue) => (
                        <IssueCard
                          key={issue.id}
                          issue={issue}
                          onJumpToCode={onJumpToCode}
                          onResolve={onResolve}
                          onDismiss={onDismiss}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
