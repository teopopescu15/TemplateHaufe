export interface MonacoFile {
  id: string;
  name: string;
  language: string;
  value: string;
  path: string;
}

export interface EditorSettings {
  fontSize: number;
  tabSize: number;
  minimap: boolean | { enabled: boolean; side?: 'right' | 'left'; showSlider?: 'always' | 'mouseover' };
  lineNumbers: 'on' | 'off' | 'relative';
  wordWrap: 'on' | 'off' | 'wordWrapColumn' | 'bounded';
  readOnly: boolean;
  scrollBeyondLastLine: boolean;
  automaticLayout: boolean;
  stickyScroll?: { enabled: boolean; maxLineCount?: number };
  folding?: boolean;
  glyphMargin?: boolean;
}

export type EditorMode = 'code' | 'diff' | 'readonly';

export type MonacoTheme = 'vs-dark' | 'vs-light';

export interface Language {
  id: string;
  name: string;
  extension: string;
}

export interface DiffFile {
  original: string;
  modified: string;
  language: string;
}
