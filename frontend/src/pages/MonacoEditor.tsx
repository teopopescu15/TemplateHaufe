import React, { useState, Suspense, lazy, useCallback, useEffect, useRef } from 'react';
import { Code2, Settings, X, GitBranch, Save, FileText, RefreshCw, GitCommit } from 'lucide-react';
import { MonacoFile, EditorSettings, MonacoTheme } from '@/types/monaco';
import EditorTabs from '@/components/monaco/EditorTabs';
import LanguageSelector from '@/components/monaco/LanguageSelector';
import ThemeSwitcher from '@/components/monaco/ThemeSwitcher';
import SettingsPanel from '@/components/monaco/SettingsPanel';
import FileTree from '@/components/monaco/FileTree';
import GitHubConnect from '@/components/monaco/GitHubConnect';
import RepositorySelector from '@/components/monaco/RepositorySelector';
import GitStatusPanel from '@/components/monaco/GitStatusPanel';
import DiffViewer from '@/components/monaco/DiffViewer';
import CommitDialog from '@/components/monaco/CommitDialog';
import { AutoReviewButton } from '@/components/monaco/AutoReviewButton';
import { IssuesBadge } from '@/components/monaco/IssuesBadge';
import { IssuesPanel } from '@/components/monaco/IssuesPanel';
import { MobileMenu } from '@/components/monaco/MobileMenu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import api from '@/services/api';
import { useCodeReview } from '@/hooks/useCodeReview';
import type { ReviewConfigInput, CodeIssue } from '@/types/codeReview';
import type { editor as MonacoEditorType } from 'monaco-editor';

const Editor = lazy(() => import('@monaco-editor/react'));
const DiffEditor = lazy(() => import('@monaco-editor/react').then(mod => ({ default: mod.DiffEditor })));

const DEFAULT_FILES: MonacoFile[] = [
  {
    id: '1',
    name: 'example.js',
    language: 'javascript',
    value: `// Welcome to Monaco Editor!\nfunction greet(name) {\n  console.log(\`Hello, \${name}!\`);\n}\n\ngreet('Developer');`,
    path: 'example.js'
  }
];

const MonacoEditor: React.FC = () => {
  const [files, setFiles] = useState<MonacoFile[]>(DEFAULT_FILES);
  const [activeFileId, setActiveFileId] = useState('1');
  const [theme, setTheme] = useState<MonacoTheme>('vs-dark');
  const [settingsPanelOpen, setSettingsPanelOpen] = useState(false);
  const [mode, setMode] = useState<'code' | 'diff'>('code');
  const [showWelcome, setShowWelcome] = useState(true);
  const [diffData] = useState({
    original: '// Original code\nfunction hello() {\n  console.log("Hello");\n}',
    modified: '// Modified code\nfunction greet(name) {\n  console.log(`Hello, ${name}!`);\n}'
  });

  const [settings, setSettings] = useState<EditorSettings>({
    fontSize: 14,
    tabSize: 2,
    minimap: { enabled: true, side: 'right', showSlider: 'always' },
    lineNumbers: 'on',
    wordWrap: 'on',
    readOnly: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    stickyScroll: { enabled: true, maxLineCount: 5 },
    folding: true,
    glyphMargin: true  // Enable glyph margin for git decorations
  });

  // GitHub repository state
  const [selectedRepo, setSelectedRepo] = useState<{ owner: string; name: string; fullName: string } | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [githubFiles, setGithubFiles] = useState<Array<{ path: string; sha: string }>>([]);
  const [loadingGithubFiles, setLoadingGithubFiles] = useState(false);

  // Project management state
  const [currentProjectId, setCurrentProjectId] = useState<number | null>(null);
  const [projectChanges, setProjectChanges] = useState<Array<{ file_path: string; status: string; last_modified_at: string }>>([]);
  const [showGitPanel, setShowGitPanel] = useState(false);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [showCommitDialog, setShowCommitDialog] = useState(false);
  const [showIssuesPanel, setShowIssuesPanel] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  // Monaco editor instance and decorations
  const editorRef = useRef<MonacoEditorType.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('monaco-editor') | null>(null);
  const decorationsCollectionRef = useRef<MonacoEditorType.IEditorDecorationsCollection | null>(null);

  // Code review hook
  const {
    issues,
    stats,
    loading: loadingIssues,
    reviewing,
    healthStatus,
    triggerReview,
    loadIssues,
    resolveIssue,
    dismissIssue,
    checkHealth,
  } = useCodeReview({
    projectId: currentProjectId || 0,
    autoLoad: false,
  });

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  // Load project changes from backend (defined first as it's used by other functions)
  const loadProjectChanges = useCallback(async (projectId: number) => {
    try {
      const response = await api.get(`/projects/${projectId}/changes`);
      setProjectChanges(response.data.changes || []);
    } catch (error) {
      console.error('Failed to load project changes:', error);
      setProjectChanges([]);
    }
  }, []);

  // Save file to database
  const saveFileToDatabase = useCallback(async (filePath: string, content: string) => {
    if (!currentProjectId) return;

    setSaveStatus('saving');
    try {
      await api.put(`/projects/${currentProjectId}/files?path=${encodeURIComponent(filePath)}`, {
        content
      });

      // Reload changes after save
      await loadProjectChanges(currentProjectId);

      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save file:', error);
      setSaveStatus('idle');
    }
  }, [currentProjectId, loadProjectChanges]);

  // Handle Monaco editor mount
  const handleEditorDidMount = useCallback((editor: MonacoEditorType.IStandaloneCodeEditor, monaco: typeof import('monaco-editor')) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  }, []);

  // Parse unified diff to get line numbers of changes
  const parseUnifiedDiff = (diffText: string): { modified: number[]; added: number[]; deleted: { line: number; count: number }[] } => {
    const modified: number[] = [];
    const added: number[] = [];
    const deleted: { line: number; count: number }[] = [];

    const lines = diffText.split('\n');
    let currentLine = 0;
    let deletedCount = 0;
    let lastDeletedLine = 0;

    for (const line of lines) {
      if (line.startsWith('@@')) {
        // Parse hunk header: @@ -old_start,old_count +new_start,new_count @@
        const match = line.match(/@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          currentLine = parseInt(match[1], 10) - 1;
          if (deletedCount > 0) {
            deleted.push({ line: lastDeletedLine, count: deletedCount });
            deletedCount = 0;
          }
        }
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        currentLine++;
        added.push(currentLine);
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        if (deletedCount === 0) {
          lastDeletedLine = currentLine + 1;
        }
        deletedCount++;
      } else if (line.startsWith(' ')) {
        if (deletedCount > 0) {
          deleted.push({ line: lastDeletedLine, count: deletedCount });
          deletedCount = 0;
        }
        currentLine++;
      }
    }

    if (deletedCount > 0) {
      deleted.push({ line: lastDeletedLine, count: deletedCount });
    }

    // Mark lines around deletions as modified
    deleted.forEach(del => {
      if (del.line > 0 && !added.includes(del.line)) {
        modified.push(del.line);
      }
    });

    return { modified, added, deleted };
  };

  // Apply git decorations to the editor
  const applyGitDecorations = useCallback(async (filePath: string) => {
    if (!editorRef.current || !monacoRef.current || !currentProjectId) return;

    try {
      // Get diff for current file
      const response = await api.get(`/projects/${currentProjectId}/diff`);
      const diffs = response.data.diffs || [];

      const fileDiff = diffs.find((d: any) => d.filePath === filePath);

      if (!fileDiff) {
        // No changes for this file, clear decorations
        if (decorationsCollectionRef.current) {
          decorationsCollectionRef.current.clear();
        }
        return;
      }

      // Parse diff to get line numbers
      const { modified, added, deleted } = parseUnifiedDiff(fileDiff.diff);

      const monaco = monacoRef.current;
      const decorations: MonacoEditorType.IModelDeltaDecoration[] = [];

      // Add decorations for added lines
      added.forEach(lineNum => {
        decorations.push({
          range: new monaco.Range(lineNum, 1, lineNum, 1),
          options: {
            isWholeLine: true,
            className: 'git-line-added',
            linesDecorationsClassName: 'git-gutter-added',
            glyphMarginClassName: 'git-glyph-added',
            overviewRuler: {
              color: '#4ade80',
              position: monaco.editor.OverviewRulerLane.Left
            },
            minimap: {
              color: '#4ade80',
              position: monaco.editor.MinimapPosition.Inline
            }
          }
        });
      });

      // Add decorations for modified lines
      modified.forEach(lineNum => {
        if (!added.includes(lineNum)) {
          decorations.push({
            range: new monaco.Range(lineNum, 1, lineNum, 1),
            options: {
              isWholeLine: true,
              className: 'git-line-modified',
              linesDecorationsClassName: 'git-gutter-modified',
              glyphMarginClassName: 'git-glyph-modified',
              overviewRuler: {
                color: '#fb923c',
                position: monaco.editor.OverviewRulerLane.Left
              },
              minimap: {
                color: '#fb923c',
                position: monaco.editor.MinimapPosition.Inline
              }
            }
          });
        }
      });

      // Add decorations for deleted lines (show at the line where deletion occurred)
      deleted.forEach(del => {
        decorations.push({
          range: new monaco.Range(del.line, 1, del.line, 1),
          options: {
            glyphMarginClassName: 'git-glyph-deleted',
            glyphMarginHoverMessage: [{ value: `${del.count} line(s) deleted` }]
          }
        });
      });

      // Apply decorations
      if (decorationsCollectionRef.current) {
        decorationsCollectionRef.current.clear();
      }
      decorationsCollectionRef.current = editorRef.current.createDecorationsCollection(decorations);
    } catch (error) {
      console.error('Failed to apply git decorations:', error);
    }
  }, [currentProjectId]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setFiles(prev => prev.map(f =>
        f.id === activeFileId ? { ...f, value } : f
      ));
    }
  };

  // Track initial file loads to prevent auto-save on first load
  const [initiallyLoadedFiles, setInitiallyLoadedFiles] = useState<Set<string>>(new Set());

  // Auto-save with debouncing (3 seconds after user stops typing)
  useEffect(() => {
    if (!currentProjectId || !activeFile) return;

    // Don't auto-save default files (example.js, etc.)
    const isDefaultFile = activeFile.path === 'example.js' ||
                          activeFile.path.startsWith('untitled-') ||
                          !activeFile.path;

    if (isDefaultFile) return;

    // Mark file as initially loaded
    if (!initiallyLoadedFiles.has(activeFile.id)) {
      setInitiallyLoadedFiles(prev => new Set(prev).add(activeFile.id));
      return; // Don't auto-save on initial load
    }

    const timeoutId = setTimeout(async () => {
      // Only auto-save files that are part of the loaded GitHub project
      await saveFileToDatabase(activeFile.path, activeFile.value);
    }, 3000); // 3 second debounce

    return () => clearTimeout(timeoutId);
  }, [activeFile?.value, currentProjectId, activeFile?.path, activeFile?.id, saveFileToDatabase, initiallyLoadedFiles]);

  // Manual save function
  const handleSaveFile = async () => {
    const file = files.find(f => f.id === activeFileId);
    if (!file || !currentProjectId) {
      alert('No project loaded or file not selected');
      return;
    }

    // Don't save default files
    const isDefaultFile = file.path === 'example.js' ||
                          file.path.startsWith('untitled-') ||
                          !file.path;

    if (isDefaultFile) {
      alert('Cannot save default files. Please load a GitHub repository first.');
      return;
    }

    await saveFileToDatabase(file.path, file.value);
  };

  // Handle triggering code review
  const handleTriggerReview = async (config: ReviewConfigInput) => {
    if (!currentProjectId) {
      alert('No project loaded');
      return;
    }

    await triggerReview({
      config,
    });

    // Automatically open issues panel after review completes
    // This ensures users can immediately see the findings
    setShowIssuesPanel(true);
  };

  // Check health when project changes
  useEffect(() => {
    if (currentProjectId) {
      checkHealth();
    }
  }, [currentProjectId, checkHealth]);

  // Handle clicking a file in the Git status panel
  const handleGitPanelFileClick = async (filePath: string) => {
    // Check if file is already open
    const existingFile = files.find(f => f.path === filePath);
    if (existingFile) {
      setActiveFileId(existingFile.id);
      setShowGitPanel(false);
      return;
    }

    // Otherwise load and open it
    const fileName = filePath.split('/').pop() || filePath;
    await handleFileSelect(filePath, fileName);
    setShowGitPanel(false);
  };

  const handleLanguageChange = (language: string) => {
    setFiles(prev => prev.map(f =>
      f.id === activeFileId ? { ...f, language } : f
    ));
  };

  const handleNewFile = () => {
    const newId = String(Date.now());
    const newFile: MonacoFile = {
      id: newId,
      name: `untitled-${files.length + 1}.js`,
      language: 'javascript',
      value: '// New file\n',
      path: `untitled-${files.length + 1}.js`
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newId);
  };

  const handleTabClose = (fileId: string) => {
    if (files.length === 1) return; // Keep at least one file

    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      if (activeFileId === fileId) {
        setActiveFileId(newFiles[0].id);
      }
      return newFiles;
    });
  };

  // Load project from GitHub to local database
  const loadProjectToDatabase = useCallback(async (repo: any, branch: string, showMessages: boolean = true) => {
    setLoadingProject(true);
    try {
      const response = await api.post('/projects/load', {
        repoOwner: repo.owner,
        repoName: repo.name,
        repoFullName: repo.fullName,
        branch: branch,
        isPrivate: repo.private || false,
        defaultBranch: repo.defaultBranch || branch
      });

      const projectId = response.data.projectId;
      setCurrentProjectId(projectId);

      // Load initial changes
      await loadProjectChanges(projectId);

      if (showMessages) {
        const message = response.data.message;

        // Show success message
        if (response.data.filesLoaded > 0) {
          alert(`✅ Project loaded successfully!\n\n${message}`);
        } else if (response.data.filesLoaded === 0) {
          alert(`ℹ️ Repository is empty or has no code files.\n\nYou can still create new files and commit them to this repository.`);
        }

        // Show warning if some files failed to load
        if (response.data.filesFailed && response.data.filesFailed > 0) {
          console.warn(`⚠️ ${response.data.filesFailed} files failed to load:`, response.data.failedFiles);
        }
      }

      return projectId;
    } catch (error: any) {
      console.error('Failed to load project to database:', error);

      if (showMessages) {
        const errorMsg = error?.response?.data?.error || error?.message || 'Unknown error';
        alert(`❌ Failed to load project:\n\n${errorMsg}\n\nPlease try again or select a different repository.`);
      }

      throw error;
    } finally {
      setLoadingProject(false);
    }
  }, [loadProjectChanges]);

  // Pull/Sync project from GitHub (reload latest changes)
  const handlePullProject = useCallback(async () => {
    if (!selectedRepo || !selectedBranch || !currentProjectId) {
      alert('No project selected to pull from');
      return;
    }

    const confirmed = confirm(
      `🔄 Pull latest changes from GitHub?\n\n` +
      `Repository: ${selectedRepo.fullName}\n` +
      `Branch: ${selectedBranch}\n\n` +
      `⚠️ Warning: Any uncommitted local changes will be overwritten!`
    );

    if (!confirmed) return;

    try {
      await loadProjectToDatabase(selectedRepo, selectedBranch, true);
      alert('✅ Project synced successfully with GitHub!');
    } catch (error) {
      // Error already shown in loadProjectToDatabase
      console.error('Pull failed:', error);
    }
  }, [selectedRepo, selectedBranch, currentProjectId, loadProjectToDatabase]);

  // Handle successful commit
  const handleCommitSuccess = useCallback(async () => {
    if (currentProjectId) {
      // Reload changes to reflect committed files
      await loadProjectChanges(currentProjectId);

      // Clear decorations for the current file since changes were committed
      if (decorationsCollectionRef.current) {
        decorationsCollectionRef.current.clear();
      }
    }
  }, [currentProjectId, loadProjectChanges]);

  // Apply git decorations when active file or project changes load
  useEffect(() => {
    if (editorRef.current && currentProjectId && activeFile && activeFile.path) {
      // Don't apply decorations to default files
      const isDefaultFile = activeFile.path === 'example.js' ||
                            activeFile.path.startsWith('untitled-') ||
                            !activeFile.path;

      if (!isDefaultFile) {
        // Debounce decoration updates to avoid too many API calls
        const timeoutId = setTimeout(() => {
          applyGitDecorations(activeFile.path);
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [activeFile?.path, currentProjectId, projectChanges, applyGitDecorations]);

  // Re-apply decorations after save
  useEffect(() => {
    if (saveStatus === 'saved' && activeFile && currentProjectId) {
      const isDefaultFile = activeFile.path === 'example.js' ||
                            activeFile.path.startsWith('untitled-') ||
                            !activeFile.path;

      if (!isDefaultFile) {
        // Re-apply decorations after a short delay to ensure backend has processed the save
        const timeoutId = setTimeout(() => {
          applyGitDecorations(activeFile.path);
        }, 1000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [saveStatus, activeFile, currentProjectId, applyGitDecorations]);

  const handleRepositorySelect = async (repo: any, branch: string) => {
    setSelectedRepo({ owner: repo.owner, name: repo.name, fullName: repo.fullName });
    setSelectedBranch(branch);
    setLoadingGithubFiles(true);

    try {
      // Load file tree from GitHub
      const response = await api.get(`/github/repos/${repo.owner}/${repo.name}/tree/${branch}`);
      setGithubFiles(response.data.tree);

      // Load project to database (showMessages=false to avoid duplicate alerts in catch block)
      await loadProjectToDatabase(repo, branch, false);

      // Show success message here instead
      console.log(`✅ Repository "${repo.fullName}" loaded successfully`);
    } catch (error: any) {
      console.error('Failed to load repository:', error);

      // Handle empty repository gracefully
      if (error?.response?.status === 404 || error?.response?.data?.message?.includes('empty')) {
        // Repository is empty - still create project entry but with no files
        setGithubFiles([]);

        try {
          // Try to load empty project to database
          await loadProjectToDatabase(repo, branch, false);
          alert(`ℹ️ Repository "${repo.fullName}" is empty.\n\nYou can create new files and commit them to this repository.`);
        } catch (dbError) {
          console.error('Failed to create project entry:', dbError);
          alert(`❌ Failed to load repository.\n\nThe repository appears to be empty or inaccessible.`);
          setCurrentProjectId(null);
          setProjectChanges([]);
        }
      } else {
        // Other errors
        const errorMsg = error?.response?.data?.error || error?.message || 'Unknown error';
        alert(`❌ Failed to load repository:\n\n${errorMsg}\n\nPlease try again or select a different repository.`);
        setGithubFiles([]);
        setCurrentProjectId(null);
        setProjectChanges([]);
      }
    } finally {
      setLoadingGithubFiles(false);
    }
  };

  const handleFileSelect = async (fileKey: string, fileName: string) => {
    // Check if file is already open
    const existingFile = files.find(f => f.path === fileKey);

    if (existingFile) {
      // File already open, just switch to it
      setActiveFileId(existingFile.id);
      return;
    }

    // Create new file from selection
    const newId = String(Date.now());

    // Determine language based on file extension
    const getLanguageFromFileName = (name: string): string => {
      if (name.endsWith('.ts') || name.endsWith('.tsx')) return 'typescript';
      if (name.endsWith('.js') || name.endsWith('.jsx')) return 'javascript';
      if (name.endsWith('.json')) return 'json';
      if (name.endsWith('.css') || name.endsWith('.scss')) return 'css';
      if (name.endsWith('.html')) return 'html';
      if (name.endsWith('.md')) return 'markdown';
      if (name.endsWith('.py')) return 'python';
      if (name.endsWith('.go')) return 'go';
      if (name.endsWith('.rs')) return 'rust';
      if (name.endsWith('.java')) return 'java';
      if (name.endsWith('.cpp') || name.endsWith('.c') || name.endsWith('.h')) return 'cpp';
      if (name.endsWith('.sql')) return 'sql';
      if (name.endsWith('.yaml') || name.endsWith('.yml')) return 'yaml';
      if (name.endsWith('.xml')) return 'xml';
      if (name.endsWith('.sh')) return 'shell';
      return 'plaintext';
    };

    let fileContent = `// ${fileName}\n// File loaded from project explorer\n`;

    // If we have a loaded project, try to load from database first (includes local changes)
    if (currentProjectId) {
      try {
        const response = await api.get(
          `/projects/${currentProjectId}/files?path=${encodeURIComponent(fileKey)}`
        );
        // Use current_content if it exists (local changes), otherwise use original_content
        fileContent = response.data.content || response.data.originalContent || fileContent;
      } catch (error: any) {
        // If file not found in database, fall back to GitHub
        console.log(`File not in database, loading from GitHub: ${fileKey}`);

        // Try loading from GitHub
        if (selectedRepo && selectedBranch) {
          try {
            const response = await api.get(
              `/github/repos/${selectedRepo.owner}/${selectedRepo.name}/contents?path=${fileKey}&ref=${selectedBranch}`
            );
            fileContent = response.data.content;
          } catch (ghError) {
            console.error('Failed to load file from GitHub:', ghError);
            fileContent = `// Failed to load ${fileName}\n// Error: Could not fetch file content\n`;
          }
        }
      }
    } else if (selectedRepo && selectedBranch) {
      // No project loaded, load directly from GitHub
      try {
        const response = await api.get(
          `/github/repos/${selectedRepo.owner}/${selectedRepo.name}/contents?path=${fileKey}&ref=${selectedBranch}`
        );
        fileContent = response.data.content;
      } catch (error) {
        console.error('Failed to load file from GitHub:', error);
        fileContent = `// Failed to load ${fileName}\n// Error: Could not fetch file content from GitHub\n`;
      }
    }

    const newFile: MonacoFile = {
      id: newId,
      name: fileName,
      language: getLanguageFromFileName(fileName),
      value: fileContent,
      path: fileKey
    };

    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newId);
  };

  // Handle jumping to code from issue
  const handleJumpToCode = useCallback(async (issue: CodeIssue) => {
    // Check if file is already open
    const existingFile = files.find(f => f.path === issue.filePath);
    if (existingFile) {
      setActiveFileId(existingFile.id);

      // Focus and navigate to the line
      if (editorRef.current) {
        editorRef.current.revealLineInCenter(issue.lineNumber);
        editorRef.current.setPosition({
          lineNumber: issue.lineNumber,
          column: issue.columnNumber || 1,
        });
        editorRef.current.focus();
      }
    } else {
      // Load the file first
      const fileName = issue.filePath.split('/').pop() || issue.filePath;
      await handleFileSelect(issue.filePath, fileName);

      // Wait for editor to update, then navigate
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.revealLineInCenter(issue.lineNumber);
          editorRef.current.setPosition({
            lineNumber: issue.lineNumber,
            column: issue.columnNumber || 1,
          });
          editorRef.current.focus();
        }
      }, 100);
    }

    // Close the issues panel after jumping
    setShowIssuesPanel(false);
  }, [files]);

  // Handle resolving an issue
  const handleResolveIssue = useCallback(async (issueId: string) => {
    try {
      await resolveIssue(issueId);
    } catch (error) {
      console.error('Failed to resolve issue:', error);
    }
  }, [resolveIssue]);

  // Handle dismissing an issue
  const handleDismissIssue = useCallback(async (issueId: string) => {
    try {
      await dismissIssue(issueId);
    } catch (error) {
      console.error('Failed to dismiss issue:', error);
    }
  }, [dismissIssue]);

  // Handle refreshing issues
  const handleRefreshIssues = useCallback(async () => {
    if (currentProjectId) {
      await loadIssues();
    }
  }, [currentProjectId, loadIssues]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-2 py-3 md:px-4 md:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Logo Section - Always visible */}
          <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <Code2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-2xl font-bold text-white">Monaco Editor Showcase</h1>
              <p className="text-xs md:text-sm text-slate-400 hidden lg:block">Full-featured code editor powered by VS Code</p>
            </div>
          </div>

          {/* Desktop Controls - Visible on lg+ screens */}
          <div className="hidden lg:flex items-center gap-4 flex-wrap">
            <GitHubConnect />
            <RepositorySelector onRepositorySelect={handleRepositorySelect} />
            {loadingProject && (
              <span className="text-sm text-slate-400">Loading project...</span>
            )}
            <div className="h-6 w-px bg-slate-700 mx-1" />
            {currentProjectId && (
              <>
                <Button
                  onClick={handlePullProject}
                  variant="outline"
                  size="sm"
                  disabled={loadingProject}
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
                  title="Pull latest changes from GitHub (overwrites local changes)"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingProject ? 'animate-spin' : ''}`} />
                  Pull
                </Button>
                <Button
                  onClick={handleSaveFile}
                  variant="outline"
                  size="sm"
                  disabled={saveStatus === 'saving'}
                  className={`${
                    saveStatus === 'saved'
                      ? 'bg-green-600 border-green-500 hover:bg-green-700 text-white'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
                  }`}
                  title="Save current file to database"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                </Button>
                <Button
                  onClick={() => setShowGitPanel(true)}
                  variant="outline"
                  size="sm"
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
                  title="View uncommitted changes"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Changes ({projectChanges.length})
                </Button>
                <Button
                  onClick={() => setShowDiffViewer(true)}
                  variant="outline"
                  size="sm"
                  disabled={projectChanges.length === 0}
                  className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white disabled:opacity-50"
                  title="View git diff for all changes"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Diff
                </Button>
                <Button
                  onClick={() => setShowCommitDialog(true)}
                  variant="outline"
                  size="sm"
                  disabled={projectChanges.length === 0}
                  className="bg-green-700 border-green-600 hover:bg-green-600 text-white disabled:opacity-50"
                  title="Commit and push changes to GitHub"
                >
                  <GitCommit className="w-4 h-4 mr-2" />
                  Commit
                </Button>
                <div className="h-6 w-px bg-slate-700 mx-1" />
                <AutoReviewButton
                  projectId={currentProjectId}
                  onTriggerReview={handleTriggerReview}
                  reviewing={reviewing}
                  healthStatus={healthStatus}
                  issueCount={stats.active}
                />
                <IssuesBadge
                  stats={stats}
                  onClick={() => setShowIssuesPanel(true)}
                  reviewing={reviewing}
                />
                <div className="h-6 w-px bg-slate-700 mx-1" />
              </>
            )}
            <LanguageSelector
              value={activeFile.language}
              onChange={handleLanguageChange}
            />
            <ThemeSwitcher theme={theme} onChange={setTheme} />
            <Button
              onClick={() => setMode(mode === 'code' ? 'diff' : 'code')}
              variant={mode === 'diff' ? 'default' : 'outline'}
              size="sm"
              className={mode === 'diff' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'}
            >
              {mode === 'diff' ? 'Code Mode' : 'Diff Mode'}
            </Button>
            <Button
              onClick={() => setSettingsPanelOpen(true)}
              variant="outline"
              size="sm"
              className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          {/* Tablet Controls - Visible on md to lg screens */}
          <div className="hidden md:flex lg:hidden items-center gap-2 flex-shrink-0">
            {currentProjectId && (
              <>
                <Button
                  onClick={handleSaveFile}
                  variant="outline"
                  size="sm"
                  disabled={saveStatus === 'saving'}
                  className={`px-2 ${
                    saveStatus === 'saved'
                      ? 'bg-green-600 border-green-500 hover:bg-green-700 text-white'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
                  }`}
                  title="Save current file to database"
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setShowCommitDialog(true)}
                  variant="outline"
                  size="sm"
                  disabled={projectChanges.length === 0}
                  className="bg-green-700 border-green-600 hover:bg-green-600 text-white disabled:opacity-50 px-2"
                  title="Commit and push changes to GitHub"
                >
                  <GitCommit className="w-4 h-4" />
                </Button>
                <IssuesBadge
                  stats={stats}
                  onClick={() => setShowIssuesPanel(true)}
                  reviewing={reviewing}
                />
              </>
            )}
            <MobileMenu>
              <GitHubConnect />
              <RepositorySelector onRepositorySelect={handleRepositorySelect} />
              {currentProjectId && (
                <>
                  <div className="border-t border-slate-700 my-2" />
                  <Button
                    onClick={handlePullProject}
                    variant="outline"
                    size="sm"
                    disabled={loadingProject}
                    className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-white justify-start"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loadingProject ? 'animate-spin' : ''}`} />
                    Pull Changes
                  </Button>
                  <Button
                    onClick={() => setShowGitPanel(true)}
                    variant="outline"
                    size="sm"
                    className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-white justify-start"
                  >
                    <GitBranch className="w-4 h-4 mr-2" />
                    Changes ({projectChanges.length})
                  </Button>
                  <Button
                    onClick={() => setShowDiffViewer(true)}
                    variant="outline"
                    size="sm"
                    disabled={projectChanges.length === 0}
                    className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-white disabled:opacity-50 justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    View Diff
                  </Button>
                  <div className="border-t border-slate-700 my-2" />
                  <AutoReviewButton
                    projectId={currentProjectId}
                    onTriggerReview={handleTriggerReview}
                    reviewing={reviewing}
                    healthStatus={healthStatus}
                    issueCount={stats.active}
                  />
                  <div className="border-t border-slate-700 my-2" />
                </>
              )}
              <LanguageSelector
                value={activeFile.language}
                onChange={handleLanguageChange}
              />
              <ThemeSwitcher theme={theme} onChange={setTheme} />
              <Button
                onClick={() => setMode(mode === 'code' ? 'diff' : 'code')}
                variant={mode === 'diff' ? 'default' : 'outline'}
                size="sm"
                className={`w-full justify-start ${mode === 'diff' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'}`}
              >
                {mode === 'diff' ? 'Code Mode' : 'Diff Mode'}
              </Button>
              <Button
                onClick={() => setSettingsPanelOpen(true)}
                variant="outline"
                size="sm"
                className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-white justify-start"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </MobileMenu>
          </div>

          {/* Mobile Menu - Visible on sm- screens */}
          <MobileMenu>
            <GitHubConnect />
            <RepositorySelector onRepositorySelect={handleRepositorySelect} />
            {currentProjectId && (
              <>
                <div className="border-t border-slate-700 my-2" />
                <Button
                  onClick={handlePullProject}
                  variant="outline"
                  size="sm"
                  disabled={loadingProject}
                  className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-white justify-start"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loadingProject ? 'animate-spin' : ''}`} />
                  Pull Changes
                </Button>
                <Button
                  onClick={handleSaveFile}
                  variant="outline"
                  size="sm"
                  disabled={saveStatus === 'saving'}
                  className={`w-full justify-start ${
                    saveStatus === 'saved'
                      ? 'bg-green-600 border-green-500 hover:bg-green-700 text-white'
                      : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
                  }`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved!' : 'Save'}
                </Button>
                <Button
                  onClick={() => setShowGitPanel(true)}
                  variant="outline"
                  size="sm"
                  className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-white justify-start"
                >
                  <GitBranch className="w-4 h-4 mr-2" />
                  Changes ({projectChanges.length})
                </Button>
                <Button
                  onClick={() => setShowDiffViewer(true)}
                  variant="outline"
                  size="sm"
                  disabled={projectChanges.length === 0}
                  className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-white disabled:opacity-50 justify-start"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Diff
                </Button>
                <Button
                  onClick={() => setShowCommitDialog(true)}
                  variant="outline"
                  size="sm"
                  disabled={projectChanges.length === 0}
                  className="w-full bg-green-700 border-green-600 hover:bg-green-600 text-white disabled:opacity-50 justify-start"
                >
                  <GitCommit className="w-4 h-4 mr-2" />
                  Commit & Push
                </Button>
                <div className="border-t border-slate-700 my-2" />
                <AutoReviewButton
                  projectId={currentProjectId}
                  onTriggerReview={handleTriggerReview}
                  reviewing={reviewing}
                  healthStatus={healthStatus}
                  issueCount={stats.active}
                />
                <IssuesBadge
                  stats={stats}
                  onClick={() => setShowIssuesPanel(true)}
                  reviewing={reviewing}
                />
                <div className="border-t border-slate-700 my-2" />
              </>
            )}
            <LanguageSelector
              value={activeFile.language}
              onChange={handleLanguageChange}
            />
            <ThemeSwitcher theme={theme} onChange={setTheme} />
            <Button
              onClick={() => setMode(mode === 'code' ? 'diff' : 'code')}
              variant={mode === 'diff' ? 'default' : 'outline'}
              size="sm"
              className={`w-full justify-start ${mode === 'diff' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'}`}
            >
              {mode === 'diff' ? 'Code Mode' : 'Diff Mode'}
            </Button>
            <Button
              onClick={() => setSettingsPanelOpen(true)}
              variant="outline"
              size="sm"
              className="w-full bg-slate-800 border-slate-700 hover:bg-slate-700 text-white justify-start"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </MobileMenu>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="flex-1">
          {/* File Tree Sidebar */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={40} className="border-r border-slate-800">
            <FileTree
              onFileSelect={handleFileSelect}
              githubFiles={githubFiles}
              loadingGithubFiles={loadingGithubFiles}
              fileChanges={projectChanges}
            />
          </ResizablePanel>

          <ResizableHandle withHandle className="bg-slate-800 hover:bg-slate-700" />

          {/* Editor Area */}
          <ResizablePanel defaultSize={80} className="flex flex-col">
          {/* Tabs */}
          <EditorTabs
            files={files}
            activeFileId={activeFileId}
            onTabClick={setActiveFileId}
            onTabClose={handleTabClose}
            onNewFile={handleNewFile}
          />

          {/* Editor Container */}
          <div className="flex-1 relative">
        {showWelcome && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl z-10 max-w-lg">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">Welcome to Monaco Editor!</h3>
                <ul className="text-sm text-slate-300 space-y-1">
                  <li>• Switch languages with the dropdown</li>
                  <li>• Create multiple files with "New File"</li>
                  <li>• Toggle theme (Dark/Light)</li>
                  <li>• Customize settings (font, minimap, etc.)</li>
                  <li>• Try Diff Mode to compare code</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-xs text-slate-400">
                    <strong>Shortcuts:</strong> Ctrl+F (Find), Ctrl+H (Replace), Ctrl+G (Go to Line), F1 (Command Palette)
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setShowWelcome(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        <Suspense
          fallback={
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-slate-400">Loading Monaco Editor...</p>
              </div>
            </div>
          }
        >
          {mode === 'code' ? (
            <Editor
              height="calc(100vh - 190px)"
              language={activeFile.language}
              value={activeFile.value}
              theme={theme}
              path={activeFile.path}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              options={settings}
              loading={<p className="text-slate-400 text-center p-8">Initializing editor...</p>}
            />
          ) : (
            <DiffEditor
              height="calc(100vh - 190px)"
              language={activeFile.language}
              original={diffData.original}
              modified={diffData.modified}
              theme={theme}
              options={{
                ...settings,
                renderSideBySide: true,
                enableSplitViewResizing: true,
                renderIndicators: true,
                readOnly: true
              }}
              loading={<p className="text-slate-400 text-center p-8">Initializing diff viewer...</p>}
            />
          )}
        </Suspense>
          </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        settings={settings}
        onChange={setSettings}
        isOpen={settingsPanelOpen}
        onClose={() => setSettingsPanelOpen(false)}
      />

      {/* Git Status Panel */}
      <Sheet open={showGitPanel} onOpenChange={setShowGitPanel}>
        <SheetContent side="right" className="w-[400px] bg-slate-900 border-slate-800">
          <SheetHeader>
            <SheetTitle className="text-white">Git Changes</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <GitStatusPanel
              changes={projectChanges}
              onFileClick={handleGitPanelFileClick}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Diff Viewer Panel */}
      <Sheet open={showDiffViewer} onOpenChange={setShowDiffViewer}>
        <SheetContent side="right" className="w-[95vw] sm:max-w-[1280px] md:max-w-[1600px] lg:max-w-[1800px] max-w-[2000px] bg-slate-900 border-slate-800 p-0">
          {currentProjectId && (
            <DiffViewer
              projectId={currentProjectId}
              onClose={() => setShowDiffViewer(false)}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Commit Dialog */}
      {currentProjectId && (
        <CommitDialog
          isOpen={showCommitDialog}
          onClose={() => setShowCommitDialog(false)}
          projectId={currentProjectId}
          changes={projectChanges}
          onSuccess={handleCommitSuccess}
        />
      )}

      {/* Issues Panel */}
      <IssuesPanel
        open={showIssuesPanel}
        onClose={() => setShowIssuesPanel(false)}
        issues={issues}
        stats={stats}
        onJumpToCode={handleJumpToCode}
        onResolve={handleResolveIssue}
        onDismiss={handleDismissIssue}
        onRefresh={handleRefreshIssues}
        loading={loadingIssues}
      />
    </div>
  );
};

export default MonacoEditor;
