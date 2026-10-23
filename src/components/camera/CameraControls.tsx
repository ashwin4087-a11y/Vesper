import React from 'react';
import { Camera, CameraOff, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { CameraState } from '../../types/hand';
import { Button } from '../ui/Button';
import { Tooltip } from '../ui/Tooltip';

export interface CameraControlsProps {
  cameraState: CameraState;
  showLandmarks: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onRestartCamera: () => void;
  onToggleLandmarks: () => void;
}

export const CameraControls: React.FC<CameraControlsProps> = ({
  cameraState,
  showLandmarks,
  onStartCamera,
  onStopCamera,
  onRestartCamera,
  onToggleLandmarks,
}) => {
  const isActive = cameraState === CameraState.ACTIVE;
  const isRequesting = cameraState === CameraState.REQUESTING;

  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      {!isActive ? (
        <Button
          variant="primary"
          size="sm"
          onClick={onStartCamera}
          disabled={isRequesting}
          className="flex-1"
        >
          <Camera className="w-3.5 h-3.5" />
          <span>{isRequesting ? 'Requesting Access…' : 'Enable Camera'}</span>
        </Button>
      ) : (
        <div className="flex items-center gap-1.5 flex-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={onStopCamera}
            className="flex-1"
          >
            <CameraOff className="w-3.5 h-3.5 text-[#E53E3E]" />
            <span>Stop Camera</span>
          </Button>
          <Tooltip content="Restart Camera Stream" side="top">
            <Button
              variant="secondary"
              size="sm"
              onClick={onRestartCamera}
              aria-label="Restart Camera Stream"
              className="px-2.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </Button>
          </Tooltip>
        </div>
      )}

      <Tooltip
        content={
          showLandmarks ? 'Hide Hand Landmarks' : 'Show Hand Landmarks'
        }
        shortcut="L"
        side="top"
      >
        <Button
          variant="secondary"
          size="sm"
          active={showLandmarks}
          onClick={onToggleLandmarks}
          aria-label={
            showLandmarks ? 'Hide Hand Landmarks' : 'Show Hand Landmarks'
          }
          className="px-2.5"
        >
          {showLandmarks ? (
            <Eye className="w-3.5 h-3.5" />
          ) : (
            <EyeOff className="w-3.5 h-3.5" />
          )}
        </Button>
      </Tooltip>
    </div>
  );
};
