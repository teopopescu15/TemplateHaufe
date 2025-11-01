import React, { useState } from 'react';
import { Sparkles, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReviewConfigDialog } from './ReviewConfigDialog';
import type { ReviewConfigInput } from '@/types/codeReview';

interface AutoReviewButtonProps {
  projectId: number | null;
  onTriggerReview: (config: ReviewConfigInput) => Promise<void>;
  reviewing: boolean;
  healthStatus: {
    ollamaAvailable: boolean;
    modelAvailable: boolean;
    checked: boolean;
  };
  issueCount?: number;
}

/**
 * Auto-Review Button with config dialog
 * Allows users to trigger AI code review with customizable settings
 */
export const AutoReviewButton: React.FC<AutoReviewButtonProps> = ({
  projectId,
  onTriggerReview,
  reviewing,
  healthStatus,
  issueCount = 0,
}) => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  // Default configuration
  const defaultConfig: Omit<ReviewConfigInput, 'projectId'> = {
    enabledGuidelines: ['eslint'],
    enabledDimensions: ['security', 'linting', 'architecture'],
    customInstructions: '',
    modelName: 'gpt-oss:120b-cloud',
  };

  const handleQuickReview = async () => {
    if (!projectId) return;

    await onTriggerReview({
      projectId,
      ...defaultConfig,
    });
  };

  const handleConfiguredReview = async (config: Omit<ReviewConfigInput, 'projectId'>) => {
    if (!projectId) return;

    await onTriggerReview({
      projectId,
      ...config,
    });
    setConfigDialogOpen(false);
  };

  const isDisabled = !projectId || reviewing || !healthStatus.ollamaAvailable || !healthStatus.modelAvailable;

  const getTooltipMessage = () => {
    if (!projectId) return 'Select a project first';
    if (!healthStatus.checked) return 'Checking AI service...';
    if (!healthStatus.ollamaAvailable) return 'AI service not available';
    if (!healthStatus.modelAvailable) return 'AI model not available';
    if (reviewing) return 'Review in progress...';
    return 'Run AI code review';
  };

  return (
    <>
      <div className="flex items-center gap-1 w-full sm:w-auto">
        {/* Main Review Button */}
        <Button
          onClick={handleQuickReview}
          variant="outline"
          size="sm"
          disabled={isDisabled}
          className={`flex-1 sm:flex-none ${
            reviewing
              ? 'bg-purple-600 border-purple-500 text-white animate-pulse'
              : 'bg-purple-700 border-purple-600 hover:bg-purple-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={getTooltipMessage()}
        >
          <Sparkles className={`w-4 h-4 sm:mr-2 ${reviewing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{reviewing ? 'Reviewing...' : 'AI Review'}</span>
          {issueCount > 0 && !reviewing && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
              {issueCount}
            </span>
          )}
        </Button>

        {/* Config Button */}
        <Button
          onClick={() => setConfigDialogOpen(true)}
          variant="outline"
          size="sm"
          disabled={isDisabled}
          className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white disabled:opacity-50 px-2"
          title="Configure review settings"
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Configuration Dialog */}
      <ReviewConfigDialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        onReview={handleConfiguredReview}
        projectId={projectId}
      />
    </>
  );
};
