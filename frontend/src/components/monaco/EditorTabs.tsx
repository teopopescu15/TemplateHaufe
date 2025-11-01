import React from 'react';
import { X, Plus, FileCode } from 'lucide-react';
import { MonacoFile } from '@/types/monaco';
import { Button } from '@/components/ui/button';

interface EditorTabsProps {
  files: MonacoFile[];
  activeFileId: string;
  onTabClick: (fileId: string) => void;
  onTabClose: (fileId: string) => void;
  onNewFile: () => void;
}

export const EditorTabs: React.FC<EditorTabsProps> = ({
  files,
  activeFileId,
  onTabClick,
  onTabClose,
  onNewFile
}) => {
  return (
    <div className="flex items-center gap-1 bg-slate-900 border-b border-slate-800 px-2 py-1 overflow-x-auto">
      {files.map(file => {
        const isActive = file.id === activeFileId;
        return (
          <div
            key={file.id}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer
              transition-colors group min-w-[120px] max-w-[200px]
              ${isActive
                ? 'bg-slate-800 text-white'
                : 'bg-slate-900/50 text-slate-400 hover:bg-slate-800/50 hover:text-slate-300'
              }
            `}
            onClick={() => onTabClick(file.id)}
          >
            <FileCode className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 truncate text-sm font-medium">
              {file.name}
            </span>
            {files.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(file.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-700 rounded p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        );
      })}

      <Button
        onClick={onNewFile}
        variant="ghost"
        size="sm"
        className="ml-2 text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <Plus className="w-4 h-4 mr-1" />
        New File
      </Button>
    </div>
  );
};

export default EditorTabs;
