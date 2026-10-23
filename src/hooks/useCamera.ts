import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraState } from '../types/hand';

export interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  cameraState: CameraState;
  errorMessage: string | null;
  startCamera: () => Promise<boolean>;
  stopCamera: () => void;
  restartCamera: () => Promise<boolean>;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraState, setCameraState] = useState<CameraState>(CameraState.IDLE);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraState((prev) =>
      prev === CameraState.IDLE ? CameraState.IDLE : CameraState.STOPPED
    );
  }, []);

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (
      typeof navigator === 'undefined' ||
      !navigator.mediaDevices ||
      typeof navigator.mediaDevices.getUserMedia !== 'function'
    ) {
      setCameraState(CameraState.ERROR);
      setErrorMessage(
        'Your browser does not support webcam access (getUserMedia). Please use a modern browser such as Chrome, Edge, or Safari, or draw directly with your mouse.'
      );
      return false;
    }

    // Clean up any existing stream before starting
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraState(CameraState.REQUESTING);
    setErrorMessage(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraState(CameraState.ACTIVE);
      setErrorMessage(null);
      return true;
    } catch (err: unknown) {
      const error = err as { name?: string; message?: string };
      const errName = error?.name || '';

      let readableError =
        'Unable to access the camera. You can still draw on the canvas using your mouse or trackpad.';

      if (
        errName === 'NotAllowedError' ||
        errName === 'PermissionDeniedError'
      ) {
        readableError =
          'Camera permission was denied. Allow camera access in your browser address bar settings to enable hand-gesture drawing, or continue with mouse drawing.';
      } else if (
        errName === 'NotFoundError' ||
        errName === 'DevicesNotFoundError'
      ) {
        readableError =
          'No webcam was detected on this device. Connect a camera and click Restart, or draw directly with your mouse.';
      } else if (
        errName === 'NotReadableError' ||
        errName === 'TrackStartError'
      ) {
        readableError =
          'Your camera is currently in use by another application. Close other video apps and click Restart.';
      } else if (errName === 'OverconstrainedError') {
        readableError =
          'The requested camera resolution is not supported by your webcam.';
      }

      setCameraState(CameraState.ERROR);
      setErrorMessage(readableError);
      return false;
    }
  }, []);

  const restartCamera = useCallback(async (): Promise<boolean> => {
    stopCamera();
    return startCamera();
  }, [stopCamera, startCamera]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  return {
    videoRef,
    cameraState,
    errorMessage,
    startCamera,
    stopCamera,
    restartCamera,
  };
}
