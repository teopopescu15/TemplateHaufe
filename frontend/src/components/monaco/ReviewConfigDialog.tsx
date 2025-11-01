import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AVAILABLE_GUIDELINES, AVAILABLE_DIMENSIONS } from '@/types/codeReview';
import type { ReviewConfigInput } from '@/types/codeReview';
import { codeReviewApi } from '@/services/codeReviewApi';

interface ReviewConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onReview: (config: Omit<ReviewConfigInput, 'projectId'>) => Promise<void>;
  projectId: number | null;
}

/**
 * Configuration dialog for AI code review
 * Allows users to customize review settings before triggering
 */
export const ReviewConfigDialog: React.FC<ReviewConfigDialogProps> = ({
  open,
  onClose,
  onReview,
  projectId,
}) => {
  const [enabledGuidelines, setEnabledGuidelines] = useState<string[]>(['eslint']);
  const [enabledDimensions, setEnabledDimensions] = useState<string[]>(['security', 'linting', 'architecture']);
  const [customInstructions, setCustomInstructions] = useState('');
  const [modelName] = useState('gpt-oss:120b-cloud');
  const [loading, setLoading] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Load existing configuration when dialog opens
  useEffect(() => {
    if (open && projectId) {
      loadConfiguration();
    }
  }, [open, projectId]);

  const loadConfiguration = async () => {
    if (!projectId) return;

    setLoadingConfig(true);
    try {
      const config = await codeReviewApi.getConfig(projectId);
      if (config) {
        setEnabledGuidelines(config.enabledGuidelines);
        setEnabledDimensions(config.enabledDimensions);
        setCustomInstructions(config.customInstructions || '');
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const toggleGuideline = (guidelineId: string) => {
    setEnabledGuidelines((prev) =>
      prev.includes(guidelineId)
        ? prev.filter((id) => id !== guidelineId)
        : [...prev, guidelineId]
    );
  };

  const toggleDimension = (dimensionId: string) => {
    setEnabledDimensions((prev) =>
      prev.includes(dimensionId)
        ? prev.filter((id) => id !== dimensionId)
        : [...prev, dimensionId]
    );
  };

  const handleReview = async () => {
    setLoading(true);
    try {
      await onReview({
        enabledGuidelines,
        enabledDimensions,
        customInstructions: customInstructions.trim() || undefined,
        modelName,
      });
    } catch (error) {
      console.error('Review failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = enabledGuidelines.length > 0 || enabledDimensions.length > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 text-white border-slate-700">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
              Configure AI Code Review
            </DialogTitle>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-slate-400">
            Customize review settings to focus on specific code quality aspects
          </DialogDescription>
        </DialogHeader>

        {loadingConfig ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span className="ml-2 text-slate-400">Loading configuration...</span>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Coding Guidelines */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-slate-200">
                  Coding Guidelines
                </h3>
                <div className="space-y-2">
                  {AVAILABLE_GUIDELINES.map((guideline) => (
                    <div
                      key={guideline.id}
                      className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{guideline.name}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{guideline.description}</p>
                      </div>
                      <Switch
                        checked={enabledGuidelines.includes(guideline.id)}
                        onCheckedChange={() => toggleGuideline(guideline.id)}
                        className="ml-3"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Dimensions */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-slate-200">
                  Analysis Dimensions
                </h3>
                <div className="space-y-2">
                  {AVAILABLE_DIMENSIONS.map((dimension) => (
                    <div
                      key={dimension.id}
                      className="flex items-start justify-between p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{dimension.icon}</span>
                          <span className="font-medium text-sm">{dimension.name}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{dimension.description}</p>
                      </div>
                      <Switch
                        checked={enabledDimensions.includes(dimension.id)}
                        onCheckedChange={() => toggleDimension(dimension.id)}
                        className="ml-3"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Instructions */}
              <div>
                <h3 className="text-sm font-semibold mb-2 text-slate-200">
                  Custom Instructions (Optional)
                </h3>
                <p className="text-xs text-slate-400 mb-3">
                  Add project-specific rules or focus areas for the AI reviewer
                </p>
                <Textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="e.g., Focus on React best practices, Check for accessibility issues..."
                  className="min-h-[100px] bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                />
              </div>

              {/* Model Info */}
              <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-300">AI Model</p>
                    <p className="text-sm text-slate-400 mt-1">{modelName}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-700">
                    Active
                  </Badge>
                </div>
              </div>

              {/* Selection Summary */}
              <div className="p-3 rounded-lg bg-purple-900/20 border border-purple-700/50">
                <p className="text-xs font-medium text-purple-300 mb-2">Review Configuration</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-slate-400">
                    {enabledGuidelines.length} guideline(s)
                  </span>
                  <span className="text-xs text-slate-500">•</span>
                  <span className="text-xs text-slate-400">
                    {enabledDimensions.length} dimension(s)
                  </span>
                  {customInstructions && (
                    <>
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs text-slate-400">Custom instructions</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
          <Button
            onClick={onClose}
            variant="outline"
            className="bg-slate-800 border-slate-700 hover:bg-slate-700 text-white"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReview}
            disabled={!isValid || loading || !projectId}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Reviewing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Start Review
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
