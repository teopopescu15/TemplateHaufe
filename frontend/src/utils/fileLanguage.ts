/**
 * File language detection and icon utilities for code review
 */

export function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();

  const languageMap: Record<string, string> = {
    'ts': 'TypeScript',
    'tsx': 'TypeScript React',
    'js': 'JavaScript',
    'jsx': 'JavaScript React',
    'py': 'Python',
    'java': 'Java',
    'go': 'Go',
    'rs': 'Rust',
    'css': 'CSS',
    'scss': 'SCSS',
    'sass': 'Sass',
    'less': 'Less',
    'html': 'HTML',
    'json': 'JSON',
    'md': 'Markdown',
    'yml': 'YAML',
    'yaml': 'YAML',
    'xml': 'XML',
    'sql': 'SQL',
    'sh': 'Shell',
    'bash': 'Bash',
    'c': 'C',
    'cpp': 'C++',
    'h': 'C Header',
    'hpp': 'C++ Header',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'dart': 'Dart',
    'vue': 'Vue',
    'svelte': 'Svelte',
  };

  return languageMap[ext || ''] || 'Unknown';
}

export function getLanguageIcon(language: string): string {
  const iconMap: Record<string, string> = {
    'TypeScript': '📘',
    'TypeScript React': '⚛️',
    'JavaScript': '📜',
    'JavaScript React': '⚛️',
    'Python': '🐍',
    'Java': '☕',
    'Go': '🔷',
    'Rust': '🦀',
    'C': '©️',
    'C++': '➕',
    'C Header': '©️',
    'C++ Header': '➕',
    'C#': '#️⃣',
    'CSS': '🎨',
    'SCSS': '🎨',
    'Sass': '🎨',
    'Less': '🎨',
    'HTML': '🌐',
    'JSON': '📋',
    'Markdown': '📝',
    'YAML': '⚙️',
    'XML': '📄',
    'SQL': '🗄️',
    'Shell': '🐚',
    'Bash': '🐚',
    'PHP': '🐘',
    'Ruby': '💎',
    'Swift': '🍎',
    'Kotlin': '🟣',
    'Dart': '🎯',
    'Vue': '💚',
    'Svelte': '🔥',
  };

  return iconMap[language] || '📄';
}

export function getShortFileName(filePath: string): string {
  const parts = filePath.split('/');
  return parts[parts.length - 1];
}
