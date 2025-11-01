import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { MonacoTheme } from '@/types/monaco';
import { Button } from '@/components/ui/button';

interface ThemeSwitcherProps {
  theme: MonacoTheme;
  onChange: (theme: MonacoTheme) => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onChange }) => {
  const isDark = theme === 'vs-dark';

  const toggleTheme = () => {
    onChange(isDark ? 'vs-light' : 'vs-dark');
  };

  return (
    <Button
      onClick={toggleTheme}
      variant="outline"
      size="sm"
      className="bg-slate-800 border-slate-700 hover:bg-slate-700 w-full sm:w-auto"
      title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
    >
      {isDark ? (
        <>
          <Sun className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline text-white">Light Theme</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline text-slate-900">Dark Theme</span>
        </>
      )}
    </Button>
  );
};

export default ThemeSwitcher;
