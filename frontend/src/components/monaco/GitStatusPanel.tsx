import React from 'react';
import { FileEdit, FilePlus, FileX, FileIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileChange {
  file_path: string;
  status: string;
  last_modified_at?: string;
}

interface GitStatusPanelProps {
  changes: FileChange[];
  onFileClick: (filePath: string) => void;
}

export const GitStatusPanel: React.FC<GitStatusPanelProps> = ({ changes, onFileClick }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'modified':
        return <FileEdit className="w-4 h-4 text-orange-400" />;
      case 'added':
        return <FilePlus className="w-4 h-4 text-green-400" />;
      case 'deleted':
        return <FileX className="w-4 h-4 text-red-400" />;
      default:
        return <FileIcon className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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

  if (changes.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-slate-400">No uncommitted changes</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="px-3 py-2 border-b border-slate-800">
        <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
          Changes ({changes.length})
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {changes.map((change) => (
            <div
              key={change.file_path}
              onClick={() => onFileClick(change.file_path)}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-slate-700 cursor-pointer transition-colors group"
            >
              {getStatusIcon(change.status)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200 truncate group-hover:text-white">
                  {change.file_path}
                </p>
              </div>
              <span className={`text-xs font-medium ${getStatusColor(change.status)}`}>
                {getStatusLabel(change.status)}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GitStatusPanel;
