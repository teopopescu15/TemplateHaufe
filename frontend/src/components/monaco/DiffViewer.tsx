import React, { useState, useEffect } from 'react';
import { DiffEditor } from '@monaco-editor/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Copy, Check } from 'lucide-react';
import api from '@/services/api';

interface FileDiff {
  filePath: string;
  status: string;
  diff: string;
  originalContent: string;
  currentContent: string;
}

interface DiffViewerProps {
  projectId: number;
  onClose?: () => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ projectId, onClose }) => {
  const [diffs, setDiffs] = useState<FileDiff[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set());
  const [copiedDiff, setCopiedDiff] = useState(false);
  const [repoInfo, setRepoInfo] = useState({ repoFullName: '', branch: '' });

  useEffect(() => {
    loadDiffs();
  }, [projectId]);

  const loadDiffs = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/projects/${projectId}/diff`);
      setDiffs(response.data.diffs || []);
      setRepoInfo({
        repoFullName: response.data.repoFullName,
        branch: response.data.branch
      });

      // Auto-expand first file
      if (response.data.diffs && response.data.diffs.length > 0) {
        setExpandedFiles(new Set([response.data.diffs[0].filePath]));
      }
    } catch (error) {
      console.error('Failed to load diffs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFileExpansion = (filePath: string) => {
    setExpandedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filePath)) {
        newSet.delete(filePath);
      } else {
        newSet.add(filePath);
      }
      return newSet;
    });
  };

  const copyAllDiffs = async () => {
    const allDiffsText = diffs.map(d => d.diff).join('\n\n');
    try {
      await navigator.clipboard.writeText(allDiffsText);
      setCopiedDiff(true);
      setTimeout(() => setCopiedDiff(false), 2000);
    } catch (error) {
      console.error('Failed to copy diff:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'modified': return 'text-orange-400';
      case 'added': return 'text-green-400';
      case 'deleted': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-slate-400">Loading diffs...</div>
      </div>
    );
  }

  if (diffs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-slate-400">No changes to display</p>
          <p className="text-sm text-slate-500 mt-2">Make some edits to see diffs here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Git Diff</h3>
            <p className="text-sm text-slate-400">
              {repoInfo.repoFullName} • {repoInfo.branch} • {diffs.length} file{diffs.length !== 1 ? 's' : ''} changed
            </p>
          </div>
          <Button
            onClick={copyAllDiffs}
            variant="outline"
            size="sm"
            className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
          >
            {copiedDiff ? (
              <>
                <Check className="w-4 h-4 mr-2 text-green-400" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy All Diffs
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Diff List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {diffs.map((fileDiff) => {
            const isExpanded = expandedFiles.has(fileDiff.filePath);

            return (
              <div key={fileDiff.filePath} className="mb-2">
                {/* File Header */}
                <div
                  onClick={() => toggleFileExpansion(fileDiff.filePath)}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-800 rounded-t hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                  <span className={`text-xs font-bold ${getStatusColor(fileDiff.status)} w-6`}>
                    {getStatusLabel(fileDiff.status)}
                  </span>
                  <span className="text-sm text-slate-200 font-mono flex-1">
                    {fileDiff.filePath}
                  </span>
                </div>

                {/* Diff Content */}
                {isExpanded && (
                  <div className="border border-t-0 border-slate-700 rounded-b overflow-hidden">
                    {/* Unified Diff Text */}
                    <div className="bg-slate-950 p-3 border-b border-slate-800">
                      <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
                        {fileDiff.diff}
                      </pre>
                    </div>

                    {/* Monaco Diff Editor */}
                    <div className="h-96">
                      <DiffEditor
                        height="100%"
                        language={getLanguageFromFileName(fileDiff.filePath)}
                        original={fileDiff.originalContent}
                        modified={fileDiff.currentContent}
                        theme="vs-dark"
                        options={{
                          readOnly: true,
                          renderSideBySide: true,
                          minimap: { enabled: false },
                          scrollBeyondLastLine: false,
                          fontSize: 12,
                          lineNumbers: 'on'
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

// Helper function to determine language from filename
const getLanguageFromFileName = (fileName: string): string => {
  if (fileName.endsWith('.ts') || fileName.endsWith('.tsx')) return 'typescript';
  if (fileName.endsWith('.js') || fileName.endsWith('.jsx')) return 'javascript';
  if (fileName.endsWith('.json')) return 'json';
  if (fileName.endsWith('.css') || fileName.endsWith('.scss')) return 'css';
  if (fileName.endsWith('.html')) return 'html';
  if (fileName.endsWith('.md')) return 'markdown';
  if (fileName.endsWith('.py')) return 'python';
  if (fileName.endsWith('.go')) return 'go';
  if (fileName.endsWith('.rs')) return 'rust';
  if (fileName.endsWith('.java')) return 'java';
  if (fileName.endsWith('.cpp') || fileName.endsWith('.c') || fileName.endsWith('.h')) return 'cpp';
  if (fileName.endsWith('.sql')) return 'sql';
  if (fileName.endsWith('.yaml') || fileName.endsWith('.yml')) return 'yaml';
  if (fileName.endsWith('.xml')) return 'xml';
  if (fileName.endsWith('.sh')) return 'shell';
  return 'plaintext';
};

export default DiffViewer;
