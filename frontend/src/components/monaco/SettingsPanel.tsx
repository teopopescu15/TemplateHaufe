import React from 'react';
import { Settings, X } from 'lucide-react';
import { EditorSettings } from '@/types/monaco';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsPanelProps {
  settings: EditorSettings;
  onChange: (settings: EditorSettings) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onChange,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const updateSetting = <K extends keyof EditorSettings>(
    key: K,
    value: EditorSettings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-slate-900 border-l border-slate-800 shadow-2xl z-50 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Editor Settings</h2>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Settings */}
      <div className="p-4 space-y-6">
        {/* Font Size */}
        <div className="space-y-2">
          <Label className="text-white">Font Size</Label>
          <Select
            value={String(settings.fontSize)}
            onValueChange={(val) => updateSetting('fontSize', Number(val))}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {[10, 12, 14, 16, 18, 20, 24].map(size => (
                <SelectItem key={size} value={String(size)} className="text-white">
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tab Size */}
        <div className="space-y-2">
          <Label className="text-white">Tab Size</Label>
          <Select
            value={String(settings.tabSize)}
            onValueChange={(val) => updateSetting('tabSize', Number(val))}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {[2, 4, 8].map(size => (
                <SelectItem key={size} value={String(size)} className="text-white">
                  {size} spaces
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Line Numbers */}
        <div className="space-y-2">
          <Label className="text-white">Line Numbers</Label>
          <Select
            value={settings.lineNumbers}
            onValueChange={(val) => updateSetting('lineNumbers', val as any)}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="on" className="text-white">On</SelectItem>
              <SelectItem value="off" className="text-white">Off</SelectItem>
              <SelectItem value="relative" className="text-white">Relative</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Word Wrap */}
        <div className="space-y-2">
          <Label className="text-white">Word Wrap</Label>
          <Select
            value={settings.wordWrap}
            onValueChange={(val) => updateSetting('wordWrap', val as any)}
          >
            <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="on" className="text-white">On</SelectItem>
              <SelectItem value="off" className="text-white">Off</SelectItem>
              <SelectItem value="bounded" className="text-white">Bounded</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Minimap */}
        <div className="flex items-center justify-between">
          <Label className="text-white">Show Minimap</Label>
          <Switch
            checked={settings.minimap}
            onCheckedChange={(checked) => updateSetting('minimap', checked)}
          />
        </div>

        {/* Read Only */}
        <div className="flex items-center justify-between">
          <Label className="text-white">Read Only</Label>
          <Switch
            checked={settings.readOnly}
            onCheckedChange={(checked) => updateSetting('readOnly', checked)}
          />
        </div>

        {/* Scroll Beyond Last Line */}
        <div className="flex items-center justify-between">
          <Label className="text-white">Scroll Beyond Last Line</Label>
          <Switch
            checked={settings.scrollBeyondLastLine}
            onCheckedChange={(checked) => updateSetting('scrollBeyondLastLine', checked)}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
