import React from 'react';
import { Language } from '@/types/monaco';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LanguageSelectorProps {
  value: string;
  onChange: (language: string) => void;
}

const LANGUAGES: Language[] = [
  { id: 'javascript', name: 'JavaScript', extension: '.js' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts' },
  { id: 'python', name: 'Python', extension: '.py' },
  { id: 'java', name: 'Java', extension: '.java' },
  { id: 'csharp', name: 'C#', extension: '.cs' },
  { id: 'cpp', name: 'C++', extension: '.cpp' },
  { id: 'go', name: 'Go', extension: '.go' },
  { id: 'rust', name: 'Rust', extension: '.rs' },
  { id: 'php', name: 'PHP', extension: '.php' },
  { id: 'ruby', name: 'Ruby', extension: '.rb' },
  { id: 'sql', name: 'SQL', extension: '.sql' },
  { id: 'json', name: 'JSON', extension: '.json' },
  { id: 'yaml', name: 'YAML', extension: '.yaml' },
  { id: 'html', name: 'HTML', extension: '.html' },
  { id: 'css', name: 'CSS', extension: '.css' },
  { id: 'markdown', name: 'Markdown', extension: '.md' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full sm:w-[140px] md:w-[180px] bg-slate-800 border-slate-700 text-white">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent className="bg-slate-800 border-slate-700">
        {LANGUAGES.map(lang => (
          <SelectItem
            key={lang.id}
            value={lang.id}
            className="text-white hover:bg-slate-700"
          >
            {lang.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSelector;
