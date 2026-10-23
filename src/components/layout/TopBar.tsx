import React, { useState } from 'react';
import {
  Camera,
  CameraOff,
  Download,
  HelpCircle,
  PanelRightClose,
  PanelRightOpen,
  SlidersHorizontal,
} from 'lucide-react';
import { CameraState } from '../../types/hand';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

export interface TopBarProps {
  artworkTitle: string;
  cameraState: CameraState;
  isRightPanelOpen: boolean;
  onChangeArtworkTitle: (title: string) => void;
  onSaveArtwork: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onToggleRightPanel: () => void;
  onExitStudio: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  artworkTitle,
  cameraState,
  isRightPanelOpen,
  onChangeArtworkTitle,
  onSaveArtwork,
  onOpenSettings,
  onOpenGuide,
  onToggleRightPanel,
  onExitStudio,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const isCameraConnected = cameraState === CameraState.ACTIVE;

  return (
    <header className="h-14 w-full bg-[#151E2D] border-b border-[#243247] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-30">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          type="button"
          onClick={onExitStudio}
          title="Return to Welcome Screen (stops camera cleanly)"
          className="font-display text-2xl font-bold tracking-tight text-[#F0F2F6] uppercase hover:text-[#D5B879] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          VESPER
        </button>
      </div>

      {/* Zone 2: Studio Indicator, Editable Artwork Name & Camera Status */}
      <div className="hidden md:flex items-center gap-4 text-xs text-[#A4B0C1] min-w-0">
        <span className="text-[#718096] whitespace-nowrap shrink-0">
          Creative Studio
        </span>
        <span aria-hidden="true" className="text-[#243247]">
          /
        </span>

        {isEditingTitle ? (
          <input
            type="text"
            value={artworkTitle}
            autoFocus
            onChange={(e) => onChangeArtworkTitle(e.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                setIsEditingTitle(false);
              }
            }}
            aria-label="Artwork Name"
            className="bg-[#0B1220] text-[#F0F2F6] border border-[#D5B879] rounded px-2 py-0.5 text-xs font-medium focus:outline-none w-44"
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingTitle(true)}
            title="Click to rename artwork"
            className="font-medium text-[#F0F2F6] hover:text-[#D5B879] transition-colors truncate max-w-[200px] cursor-pointer"
          >
            {artworkTitle || 'Untitled Study 01'}
          </button>
        )}

        <span aria-hidden="true" className="text-[#243247]">
          ·
        </span>

        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          {isCameraConnected ? (
            <>
              <Camera className="w-3.5 h-3.5 text-[#38A169]" />
              <span className="text-[#F0F2F6] font-medium">
                Camera Connected
              </span>
            </>
          ) : (
            <>
              <CameraOff className="w-3.5 h-3.5 text-[#718096]" />
              <span className="text-[#718096]">Camera Standby</span>
            </>
          )}
        </div>
      </div>

      {/* Zone 3: Studio Actions & Save Artwork CTA */}
      <div className="flex items-center gap-2 shrink-0">
        <Tooltip content="Gesture & Studio Guide" shortcut="?" side="bottom">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenGuide}
            aria-label="Gesture & Studio Guide"
            className="px-2.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden lg:inline">Guide</span>
          </Button>
        </Tooltip>

        <Tooltip content="Tracking & Pinch Settings" side="bottom">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenSettings}
            aria-label="Studio Settings"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </Tooltip>

        <Button
          variant="primary"
          size="sm"
          onClick={onSaveArtwork}
          aria-label="Save Artwork as PNG"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Save Artwork</span>
        </Button>

        <Tooltip
          content={isRightPanelOpen ? 'Collapse Studio Panel' : 'Expand Studio Panel'}
          side="bottom"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleRightPanel}
            aria-label={
              isRightPanelOpen ? 'Collapse Studio Panel' : 'Expand Studio Panel'
            }
            className="px-2"
          >
            {isRightPanelOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <PanelRightOpen className="w-4 h-4" />
            )}
          </Button>
        </Tooltip>
      </div>
    </header>
  );
};
