import React, { useState } from 'react';
import {
  Camera,
  CameraOff,
  ChevronDown,
  Download,
  HelpCircle,
  LayoutTemplate,
  PanelRightClose,
  PanelRightOpen,
  SlidersHorizontal,
} from 'lucide-react';
import { CANVAS_BACKGROUNDS, CanvasBackground } from '../../types/drawing';
import { CameraState } from '../../types/hand';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

export interface TopBarProps {
  artworkTitle: string;
  cameraState: CameraState;
  isRightPanelOpen: boolean;
  background: CanvasBackground;
  onChangeArtworkTitle: (title: string) => void;
  onSelectBackground: (background: CanvasBackground) => void;
  onOpenExportDialog: () => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onToggleRightPanel: () => void;
  onExitStudio: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  artworkTitle,
  cameraState,
  isRightPanelOpen,
  background,
  onChangeArtworkTitle,
  onSelectBackground,
  onOpenExportDialog,
  onOpenSettings,
  onOpenGuide,
  onToggleRightPanel,
  onExitStudio,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [backgroundMenuOpen, setBackgroundMenuOpen] = useState(false);

  const isCameraConnected = cameraState === CameraState.ACTIVE;

  return (
    <header className="h-14 w-full bg-[#151E2D] border-b border-[#243247] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-30">
      {/* Zone 1: Brand Wordmark & Canvas Beyond Touch Tag */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onExitStudio}
          title="Return to Welcome Screen (releases camera cleanly)"
          className="font-display text-2xl font-bold tracking-tight text-[#F0F2F6] uppercase hover:text-[#D5B879] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          VESPER
        </button>
        <span className="hidden xl:inline text-[11px] font-medium tracking-wide uppercase text-[#D5B879]/80 pl-1 border-l border-[#243247]">
          A canvas beyond touch
        </span>
      </div>

      {/* Zone 2: Editable Artwork Name, Paper Style & Camera Status */}
      <div className="hidden md:flex items-center gap-4 text-xs text-[#A4B0C1] min-w-0">
        <span className="text-[#718096] whitespace-nowrap shrink-0">Studio</span>
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
            className="font-medium text-[#F0F2F6] hover:text-[#D5B879] transition-colors truncate max-w-[180px] cursor-pointer"
          >
            {artworkTitle || 'Untitled Study 01'}
          </button>
        )}

        <span aria-hidden="true" className="text-[#243247]">
          ·
        </span>

        {/* Paper Surface Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setBackgroundMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-[#0B1220] hover:text-[#F0F2F6] transition-colors cursor-pointer"
            title="Switch Canvas Surface"
          >
            <span
              className="w-2.5 h-2.5 rounded-full border border-[#243247]"
              style={{ backgroundColor: background.hex }}
            />
            <span>{background.name}</span>
            <ChevronDown className="w-3 h-3 text-[#718096]" />
          </button>

          {backgroundMenuOpen && (
            <div className="absolute left-0 top-8 z-50 w-48 rounded-lg bg-[#151E2D] border border-[#243247] p-1.5 shadow-2xl space-y-1">
              <div className="text-[10px] uppercase font-semibold text-[#718096] px-2 py-1">
                Paper Surface
              </div>
              {CANVAS_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => {
                    onSelectBackground(bg);
                    setBackgroundMenuOpen(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 rounded-md text-xs flex items-center gap-2 transition-colors cursor-pointer ${
                    bg.id === background.id
                      ? 'bg-[#0B1220] text-[#D5B879] font-medium border border-[#D5B879]/50'
                      : 'hover:bg-[#243247]/50 text-[#A4B0C1]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full border border-[#243247]"
                    style={{ backgroundColor: bg.hex }}
                  />
                  <span>{bg.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <span aria-hidden="true" className="text-[#243247]">
          ·
        </span>

        {/* Camera Indicator */}
        <div className="flex items-center gap-1.5 whitespace-nowrap shrink-0">
          {isCameraConnected ? (
            <>
              <Camera className="w-3.5 h-3.5 text-[#38A169]" />
              <span className="text-[#F0F2F6] font-medium">Camera Live</span>
            </>
          ) : (
            <>
              <CameraOff className="w-3.5 h-3.5 text-[#718096]" />
              <span className="text-[#718096]">Camera Standby</span>
            </>
          )}
        </div>
      </div>

      {/* Zone 3: Studio Actions & Export Artwork */}
      <div className="flex items-center gap-2 shrink-0">
        <Tooltip content="Gesture Vocabulary & Guide" shortcut="?" side="bottom">
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenGuide}
            aria-label="Gesture Guide"
            className="px-2.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden lg:inline">Guide</span>
          </Button>
        </Tooltip>

        <Tooltip content="Calibration & Sensitivity Settings" side="bottom">
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
          onClick={onOpenExportDialog}
          aria-label="Export Artwork"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
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
