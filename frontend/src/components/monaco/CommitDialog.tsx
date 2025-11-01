import React, { useState, useEffect } from 'react';
import { GitCommit, CheckSquare, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import api from '@/services/api';

interface FileChange {
  file_path: string;
  status: 'modified' | 'added' | 'deleted';
}

interface CommitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  changes: FileChange[];
  onSuccess: () => void;
}

export const CommitDialog: React.FC<CommitDialogProps> = ({
  isOpen,
  onClose,
  projectId,
  changes,
  onSuccess
}) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Select all files by default when dialog opens
    if (isOpen) {
      setSelectedFiles(changes.map(c => c.file_path));
      setCommitMessage('');
    }
  }, [changes, isOpen]);

  const handleToggleFile = (filePath: string) => {
    setSelectedFiles(prev =>
      prev.includes(filePath)
        ? prev.filter(f => f !== filePath)
        : [...prev, filePath]
    );
  };

  const handleToggleAll = () => {
    if (selectedFiles.length === changes.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(changes.map(c => c.file_path));
    }
  };

  const handleCommit = async () => {
    if (!commitMessage.trim()) {
      alert('Please enter a commit message');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Please select at least one file to commit');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post(`/projects/${projectId}/commit`, {
        message: commitMessage,
        fileSelections: selectedFiles
      });

      alert(`✅ Successfully committed ${response.data.filesCommitted} file(s) to GitHub!\n\nCommit SHA: ${response.data.commitSha.substring(0, 7)}`);

      setCommitMessage('');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Commit failed:', error);
      const errorMsg = error?.response?.data?.details || error?.response?.data?.error || 'Failed to commit';
      alert(`❌ Commit failed:\n\n${errorMsg}\n\nPlease try again.`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'modified':
        return <span className="text-orange-400 font-bold">M</span>;
      case 'added':
        return <span className="text-green-400 font-bold">A</span>;
      case 'deleted':
        return <span className="text-red-400 font-bold">D</span>;
      default:
        return <span className="text-slate-400 font-bold">?</span>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'modified':
        return 'text-orange-400';
      case 'added':
        return 'text-green-400';
      case 'deleted':
        return 'text-red-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <GitCommit className="w-5 h-5 text-blue-400" />
            Commit Changes
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Select files to commit and enter a commit message. Changes will be pushed to GitHub.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Commit Message */}
          <div>
            <label className="text-sm text-slate-300 mb-2 block font-medium">
              Commit Message *
            </label>
            <Textarea
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              placeholder="Enter your commit message..."
              className="bg-slate-800 border-slate-700 text-white min-h-[100px] placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            />
          </div>

          {/* File Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-slate-300 font-medium">
                Changes ({selectedFiles.length}/{changes.length} selected)
              </label>
              <Button
                onClick={handleToggleAll}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white h-auto py-1 px-2"
                disabled={loading}
              >
                {selectedFiles.length === changes.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            <ScrollArea className="h-64 bg-slate-800 border border-slate-700 rounded-lg">
              <div className="p-2">
                {changes.map((change) => {
                  const isSelected = selectedFiles.includes(change.file_path);
                  return (
                    <div
                      key={change.file_path}
                      onClick={() => !loading && handleToggleFile(change.file_path)}
                      className={`flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-700 cursor-pointer transition-colors ${
                        loading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-slate-200 truncate block">
                          {change.file_path}
                        </span>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {getStatusIcon(change.status)}
                        <span className={`text-xs font-medium ${getStatusColor(change.status)}`}>
                          {change.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCommit}
            disabled={loading || !commitMessage.trim() || selectedFiles.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Committing...
              </>
            ) : (
              <>
                <GitCommit className="w-4 h-4 mr-2" />
                Commit {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommitDialog;
