import React, { useState, useRef, useEffect } from 'react';
import Tree from 'rc-tree';
import {
  Folder,
  FolderOpen,
  FileCode,
  FileJson,
  FileText,
  ChevronRight,
  ChevronDown,
  FilePlus,
  FolderPlus,
  Trash2,
  Edit2,
  MoreVertical
} from 'lucide-react';
import 'rc-tree/assets/index.css';

interface FileTreeNode {
  key: string;
  title: string;
  icon?: React.ReactNode;
  children?: FileTreeNode[];
  isLeaf?: boolean;
  status?: 'modified' | 'added' | 'deleted' | 'unmodified';
}

interface FileTreeProps {
  onFileSelect: (fileKey: string, fileName: string) => void;
  onTreeUpdate?: (treeData: FileTreeNode[]) => void;
  githubFiles?: Array<{ path: string; sha: string }>;
  loadingGithubFiles?: boolean;
  fileChanges?: Array<{ file_path: string; status: string }>;
}

interface ContextMenuState {
  visible: boolean;
  x: number;
  y: number;
  nodeKey: string;
  isLeaf: boolean;
}

// Initial sample project structure
const INITIAL_TREE_DATA: FileTreeNode[] = [
  {
    key: 'src',
    title: 'src',
    children: [
      {
        key: 'src/components',
        title: 'components',
        children: [
          {
            key: 'src/components/Header.tsx',
            title: 'Header.tsx',
            isLeaf: true
          },
          {
            key: 'src/components/Sidebar.tsx',
            title: 'Sidebar.tsx',
            isLeaf: true
          },
          {
            key: 'src/components/Button.tsx',
            title: 'Button.tsx',
            isLeaf: true
          }
        ]
      },
      {
        key: 'src/pages',
        title: 'pages',
        children: [
          {
            key: 'src/pages/Dashboard.tsx',
            title: 'Dashboard.tsx',
            isLeaf: true
          },
          {
            key: 'src/pages/MonacoEditor.tsx',
            title: 'MonacoEditor.tsx',
            isLeaf: true
          },
          {
            key: 'src/pages/Login.tsx',
            title: 'Login.tsx',
            isLeaf: true
          }
        ]
      },
      {
        key: 'src/hooks',
        title: 'hooks',
        children: [
          {
            key: 'src/hooks/useAuth.ts',
            title: 'useAuth.ts',
            isLeaf: true
          },
          {
            key: 'src/hooks/useMobile.ts',
            title: 'useMobile.ts',
            isLeaf: true
          }
        ]
      },
      {
        key: 'src/types',
        title: 'types',
        children: [
          {
            key: 'src/types/monaco.ts',
            title: 'monaco.ts',
            isLeaf: true
          },
          {
            key: 'src/types/auth.ts',
            title: 'auth.ts',
            isLeaf: true
          }
        ]
      },
      {
        key: 'src/App.tsx',
        title: 'App.tsx',
        isLeaf: true
      },
      {
        key: 'src/index.tsx',
        title: 'index.tsx',
        isLeaf: true
      },
      {
        key: 'src/index.css',
        title: 'index.css',
        isLeaf: true
      }
    ]
  },
  {
    key: 'public',
    title: 'public',
    children: [
      {
        key: 'public/index.html',
        title: 'index.html',
        isLeaf: true
      },
      {
        key: 'public/favicon.ico',
        title: 'favicon.ico',
        isLeaf: true
      }
    ]
  },
  {
    key: 'package.json',
    title: 'package.json',
    isLeaf: true
  },
  {
    key: 'tsconfig.json',
    title: 'tsconfig.json',
    isLeaf: true
  },
  {
    key: 'README.md',
    title: 'README.md',
    isLeaf: true
  }
];

const getFileIcon = (fileName: string) => {
  if (fileName.endsWith('.tsx') || fileName.endsWith('.ts') || fileName.endsWith('.jsx') || fileName.endsWith('.js')) {
    return <FileCode className="w-4 h-4 text-blue-400" />;
  }
  if (fileName.endsWith('.json')) {
    return <FileJson className="w-4 h-4 text-yellow-400" />;
  }
  if (fileName.endsWith('.md') || fileName.endsWith('.txt')) {
    return <FileText className="w-4 h-4 text-slate-400" />;
  }
  if (fileName.endsWith('.css') || fileName.endsWith('.scss')) {
    return <FileCode className="w-4 h-4 text-purple-400" />;
  }
  if (fileName.endsWith('.html')) {
    return <FileCode className="w-4 h-4 text-orange-400" />;
  }
  return <FileCode className="w-4 h-4 text-slate-400" />;
};

// Helper function to build tree from GitHub files
const buildTreeFromGithubFiles = (files: Array<{ path: string; sha: string }>): FileTreeNode[] => {
  const root: Record<string, any> = {};

  // Filter out hidden files, sensitive files, and system files
  const excludeFiles = ['.env', '.gitkeep', '.gitignore', '.DS_Store', 'Thumbs.db'];
  const excludeDirs = ['__pycache__', 'node_modules', '.git', 'dist', 'build'];

  const filteredFiles = files.filter(file => {
    const fileName = file.path.split('/').pop() || '';
    const pathParts = file.path.split('/');

    // Exclude if file is in excluded list
    if (excludeFiles.includes(fileName)) return false;

    // Exclude if filename starts with . (hidden files)
    if (fileName.startsWith('.')) return false;

    // Exclude if path contains excluded directories
    if (excludeDirs.some(dir => pathParts.includes(dir))) return false;

    // Exclude binary and compiled files
    if (fileName.match(/\.(pyc|pyo|pyd|so|dylib|dll|exe|bin|dat|db|sqlite|lock)$/i)) return false;

    return true;
  });

  filteredFiles.forEach((file) => {
    const parts = file.path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {};
      }
      if (index < parts.length - 1) {
        current = current[part];
      }
    });
  });

  const buildNodes = (obj: Record<string, any>, prefix = ''): FileTreeNode[] => {
    return Object.keys(obj).sort().map((key) => {
      const fullPath = prefix ? `${prefix}/${key}` : key;
      const isLeaf = obj[key] === null;

      return {
        key: fullPath,
        title: key,
        isLeaf,
        children: isLeaf ? undefined : buildNodes(obj[key], fullPath)
      };
    });
  };

  return buildNodes(root);
};

export const FileTree: React.FC<FileTreeProps> = ({
  onFileSelect,
  onTreeUpdate,
  githubFiles,
  loadingGithubFiles,
  fileChanges
}) => {
  const [treeData, setTreeData] = useState<FileTreeNode[]>(INITIAL_TREE_DATA);
  const [expandedKeys, setExpandedKeys] = useState<string[]>(['src']);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    nodeKey: '',
    isLeaf: false
  });
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const editInputRef = useRef<HTMLInputElement>(null);

  // Update tree when GitHub files change
  useEffect(() => {
    if (githubFiles && githubFiles.length > 0) {
      const newTree = buildTreeFromGithubFiles(githubFiles);
      setTreeData(newTree);
      // Auto-expand first level
      const firstLevel = newTree.filter(n => !n.isLeaf).map(n => n.key);
      setExpandedKeys(firstLevel.slice(0, 3)); // Expand first 3 folders
    } else if (!githubFiles) {
      // Reset to initial tree if no GitHub files
      setTreeData(INITIAL_TREE_DATA);
      setExpandedKeys(['src']);
    }
  }, [githubFiles]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu({ ...contextMenu, visible: false });
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [contextMenu.visible]);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingKey && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingKey]);

  const onExpand = (expandedKeysValue: React.Key[]) => {
    setExpandedKeys(expandedKeysValue as string[]);
  };

  const onSelect = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const key = selectedKeys[0] as string;
      const node = findNodeByKey(treeData, key);

      if (node?.isLeaf) {
        const fileName = key.split('/').pop() || key;
        onFileSelect(key, fileName);
      }
    }
  };

  // Helper function to find a node by key
  const findNodeByKey = (nodes: FileTreeNode[], key: string): FileTreeNode | null => {
    for (const node of nodes) {
      if (node.key === key) return node;
      if (node.children) {
        const found = findNodeByKey(node.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  // Helper function to find parent node
  const findParentNode = (nodes: FileTreeNode[], key: string, parent: FileTreeNode | null = null): FileTreeNode | null => {
    for (const node of nodes) {
      if (node.key === key) return parent;
      if (node.children) {
        const found = findParentNode(node.children, key, node);
        if (found) return found;
      }
    }
    return null;
  };

  // Update tree data recursively
  const updateTreeData = (
    nodes: FileTreeNode[],
    key: string,
    callback: (node: FileTreeNode, parent?: FileTreeNode[]) => FileTreeNode[] | FileTreeNode | null
  ): FileTreeNode[] => {
    return nodes.map(node => {
      if (node.key === key) {
        const result = callback(node, nodes);
        if (result === null) return null as any;
        if (Array.isArray(result)) return result;
        return result;
      }
      if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, callback).filter(Boolean)
        };
      }
      return node;
    }).filter(Boolean);
  };

  const handleContextMenu = (e: React.MouseEvent, nodeKey: string, isLeaf: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      nodeKey,
      isLeaf
    });
  };

  const handleNewFile = (parentKey?: string) => {
    const targetKey = parentKey || contextMenu.nodeKey;
    const newFileName = `untitled-${Date.now()}.ts`;

    if (targetKey) {
      // Add to specific folder
      const newTreeData = updateTreeData(treeData, targetKey, (node) => {
        if (!node.children) node.children = [];
        node.children.push({
          key: `${node.key}/${newFileName}`,
          title: newFileName,
          isLeaf: true
        });
        return node;
      });
      setTreeData(newTreeData);
      setExpandedKeys([...expandedKeys, targetKey]);
      onTreeUpdate?.(newTreeData);
    } else {
      // Add to root
      const newFile: FileTreeNode = {
        key: newFileName,
        title: newFileName,
        isLeaf: true
      };
      const newTreeData = [...treeData, newFile];
      setTreeData(newTreeData);
      onTreeUpdate?.(newTreeData);
    }

    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleNewFolder = (parentKey?: string) => {
    const targetKey = parentKey || contextMenu.nodeKey;
    const newFolderName = `new-folder-${Date.now()}`;

    if (targetKey) {
      // Add to specific folder
      const newTreeData = updateTreeData(treeData, targetKey, (node) => {
        if (!node.children) node.children = [];
        node.children.push({
          key: `${node.key}/${newFolderName}`,
          title: newFolderName,
          children: []
        });
        return node;
      });
      setTreeData(newTreeData);
      setExpandedKeys([...expandedKeys, targetKey]);
      onTreeUpdate?.(newTreeData);
    } else {
      // Add to root
      const newFolder: FileTreeNode = {
        key: newFolderName,
        title: newFolderName,
        children: []
      };
      const newTreeData = [...treeData, newFolder];
      setTreeData(newTreeData);
      onTreeUpdate?.(newTreeData);
    }

    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleRename = () => {
    const node = findNodeByKey(treeData, contextMenu.nodeKey);
    if (node) {
      setEditingKey(contextMenu.nodeKey);
      setEditingValue(node.title);
    }
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleRenameConfirm = () => {
    if (!editingKey || !editingValue.trim()) {
      setEditingKey(null);
      return;
    }

    const newTreeData = updateTreeData(treeData, editingKey, (node) => {
      const pathParts = node.key.split('/');
      pathParts[pathParts.length - 1] = editingValue.trim();
      return {
        ...node,
        title: editingValue.trim(),
        key: pathParts.join('/')
      };
    });

    setTreeData(newTreeData);
    onTreeUpdate?.(newTreeData);
    setEditingKey(null);
    setEditingValue('');
  };

  const handleDelete = () => {
    const newTreeData = deleteNode(treeData, contextMenu.nodeKey);
    setTreeData(newTreeData);
    onTreeUpdate?.(newTreeData);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const deleteNode = (nodes: FileTreeNode[], keyToDelete: string): FileTreeNode[] => {
    return nodes
      .filter(node => node.key !== keyToDelete)
      .map(node => ({
        ...node,
        children: node.children ? deleteNode(node.children, keyToDelete) : undefined
      }));
  };

  // Helper to get file status from changes
  const getFileStatus = (filePath: string): 'modified' | 'added' | 'deleted' | 'unmodified' => {
    if (!fileChanges) return 'unmodified';
    const change = fileChanges.find(c => c.file_path === filePath);
    return (change?.status as any) || 'unmodified';
  };

  // Helper to get status badge
  const getStatusBadge = (status: string) => {
    const config = {
      modified: { label: 'M', color: 'text-orange-400' },
      added: { label: 'A', color: 'text-green-400' },
      deleted: { label: 'D', color: 'text-red-400' },
      unmodified: { label: '', color: '' }
    };
    const { label, color } = config[status as keyof typeof config] || config.unmodified;
    return label ? <span className={`text-xs font-bold ${color} ml-auto`}>{label}</span> : null;
  };

  const renderTreeNodes = (data: FileTreeNode[]): any[] => {
    return data.map(item => {
      const isFolder = !item.isLeaf;
      const isExpanded = expandedKeys.includes(item.key);
      const isEditing = editingKey === item.key;
      const fileStatus = !isFolder ? getFileStatus(item.key) : 'unmodified';

      return {
        key: item.key,
        title: (
          <div
            className="flex items-center gap-2 py-1 group"
            onContextMenu={(e) => handleContextMenu(e, item.key, !!item.isLeaf)}
          >
            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-400" />
              ) : (
                <Folder className="w-4 h-4 text-blue-400" />
              )
            ) : (
              getFileIcon(item.title)
            )}
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onBlur={handleRenameConfirm}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRenameConfirm();
                  if (e.key === 'Escape') {
                    setEditingKey(null);
                    setEditingValue('');
                  }
                }}
                className="flex-1 bg-slate-700 text-slate-200 text-sm px-1 py-0.5 rounded outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <div className="flex items-center flex-1 justify-between">
                <span className="text-sm text-slate-200">{item.title}</span>
                {!isFolder && getStatusBadge(fileStatus)}
              </div>
            )}
          </div>
        ),
        children: item.children ? renderTreeNodes(item.children) : undefined,
        isLeaf: item.isLeaf
      };
    });
  };

  const switcherIcon = (obj: any) => {
    if (obj.isLeaf) {
      return null;
    }
    return obj.expanded ? (
      <ChevronDown className="w-4 h-4 text-slate-400" />
    ) : (
      <ChevronRight className="w-4 h-4 text-slate-400" />
    );
  };

  return (
    <div className="file-tree-container h-full bg-slate-900/50 flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="px-2 py-2 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">EXPLORER</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleNewFile()}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="New File"
          >
            <FilePlus className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleNewFolder()}
            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-slate-200 transition-colors"
            title="New Folder"
          >
            <FolderPlus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto p-2">
        <Tree
          showLine={false}
          showIcon={false}
          defaultExpandedKeys={['src']}
          expandedKeys={expandedKeys}
          onExpand={onExpand}
          onSelect={onSelect}
          treeData={renderTreeNodes(treeData)}
          switcherIcon={switcherIcon}
          className="monaco-file-tree"
        />
      </div>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div
          className="fixed bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {!contextMenu.isLeaf && (
            <>
              <button
                onClick={() => handleNewFile(contextMenu.nodeKey)}
                className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
              >
                <FilePlus className="w-4 h-4" />
                New File
              </button>
              <button
                onClick={() => handleNewFolder(contextMenu.nodeKey)}
                className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                New Folder
              </button>
              <div className="border-t border-slate-700 my-1"></div>
            </>
          )}
          <button
            onClick={handleRename}
            className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            Rename
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-slate-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}

      <style>{`
        .monaco-file-tree {
          background: transparent;
          color: #cbd5e1;
        }

        .monaco-file-tree .rc-tree-treenode {
          padding: 2px 0;
        }

        .monaco-file-tree .rc-tree-node-content-wrapper {
          padding: 2px 4px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .monaco-file-tree .rc-tree-node-content-wrapper:hover {
          background-color: rgba(71, 85, 105, 0.3);
        }

        .monaco-file-tree .rc-tree-node-selected .rc-tree-node-content-wrapper {
          background: linear-gradient(to right, rgba(59, 130, 246, 0.2), rgba(6, 182, 212, 0.2));
          border-left: 2px solid #3b82f6;
          padding-left: 2px;
        }

        .monaco-file-tree .rc-tree-switcher {
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .monaco-file-tree .rc-tree-indent-unit {
          width: 16px;
        }

        .file-tree-container::-webkit-scrollbar {
          width: 8px;
        }

        .file-tree-container::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
        }

        .file-tree-container::-webkit-scrollbar-thumb {
          background: rgba(71, 85, 105, 0.5);
          border-radius: 4px;
        }

        .file-tree-container::-webkit-scrollbar-thumb:hover {
          background: rgba(71, 85, 105, 0.8);
        }
      `}</style>
    </div>
  );
};

export default FileTree;
