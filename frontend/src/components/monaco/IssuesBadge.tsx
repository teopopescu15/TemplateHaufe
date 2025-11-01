import React from 'react';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { IssueStats } from '@/types/codeReview';

interface IssuesBadgeProps {
  stats: IssueStats;
  onClick: () => void;
  reviewing: boolean;
}

/**
 * Badge component showing issue count and severity
 * Displays in the editor toolbar
 */
export const IssuesBadge: React.FC<IssuesBadgeProps> = ({ stats, onClick, reviewing }) => {
  // Determine badge color and icon based on highest severity
  const { error, warning, info } = stats.bySeverity;

  const getVariantAndIcon = () => {
    if (error > 0) {
      return {
        variant: 'destructive' as const,
        icon: <AlertCircle className="w-4 h-4" />,
        color: 'bg-red-600 hover:bg-red-700 border-red-500',
      };
    }
    if (warning > 0) {
      return {
        variant: 'default' as const,
        icon: <AlertTriangle className="w-4 h-4" />,
        color: 'bg-yellow-600 hover:bg-yellow-700 border-yellow-500 text-white',
      };
    }
    if (info > 0) {
      return {
        variant: 'outline' as const,
        icon: <Info className="w-4 h-4" />,
        color: 'bg-blue-600 hover:bg-blue-700 border-blue-500 text-white',
      };
    }
    return {
      variant: 'outline' as const,
      icon: <Info className="w-4 h-4" />,
      color: 'bg-slate-700 hover:bg-slate-600 border-slate-600 text-slate-300',
    };
  };

  const { icon, color } = getVariantAndIcon();

  // Don't show if no active issues and not reviewing
  if (stats.active === 0 && !reviewing) {
    return null;
  }

  return (
    <Button
      onClick={onClick}
      size="sm"
      variant="outline"
      className={`${color} transition-all duration-200 h-7 sm:h-8 px-2 sm:px-3 ${
        reviewing ? 'animate-pulse' : ''
      }`}
      title={`${stats.active} active issue(s): ${error} errors, ${warning} warnings, ${info} info`}
    >
      <span className="w-3 h-3 sm:w-4 sm:h-4">{icon}</span>
      <span className="ml-1 sm:ml-2 font-semibold text-sm sm:text-base">{stats.active}</span>
      {stats.reappeared > 0 && (
        <span className="ml-1 px-1 sm:px-1.5 py-0.5 text-xs bg-orange-500 rounded-full">
          {stats.reappeared}↻
        </span>
      )}
    </Button>
  );
};
