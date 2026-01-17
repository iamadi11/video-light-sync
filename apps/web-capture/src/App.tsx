import React, { useEffect, useRef, useState } from 'react';
import { ScreenRecorder } from './capture/ScreenRecorder';
import { FrameBuffer } from './capture/FrameBuffer';
import { FrameProcessor } from '@video-light-sync/vision';

function App() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const debugRef = useRef<HTMLDivElement>(null);
  const [recorder, setRecorder] = useState<ScreenRecorder | null>(null);
  const [frameBuffer, setFrameBuffer] = useState<FrameBuffer | null>(null);
  const [processor, setProcessor] = useState<FrameProcessor | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const requestRef = useRef<number>();

  useEffect(() => {
    if (videoRef.current && !recorder) {
      const rec = new ScreenRecorder(videoRef.current);
      setRecorder(rec);

      const buf = new FrameBuffer(100, 50); // Small buffer for performance
      setFrameBuffer(buf);
      
      const proc = new FrameProcessor({ sampleStride: 4 });
      setProcessor(proc);

      if (debugRef.current) {
        buf.mountDebug(debugRef.current);
      }
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [videoRef]);

  const loop = () => {
    if (videoRef.current && frameBuffer && processor) {
      // 1. Write video frame to buffer
      frameBuffer.write(videoRef.current);

      // 2. Read buffer and calculate LightState
      const lightState = processor.process(frameBuffer.getCanvas());
      
      // Validation log (throttled visually but calculate every frame)
      // For now, spamming console is fine for validation phase
      if (Math.random() < 0.05) { // Log 5% of frames to avoid laggy console
         console.log('LightState:', lightState);
      }
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  const startCapture = async () => {
    if (!recorder) return;
    try {
      await recorder.start();
      setIsCapturing(true);
      requestRef.current = requestAnimationFrame(loop);
    } catch (e) {
      console.error(e);
    }
  };

  const stopCapture = () => {
    if (!recorder) return;
    recorder.stop();
    setIsCapturing(false);
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h1>Video Light Sync - Capture</h1>

      <div style={{ marginBottom: 20 }}>
        {!isCapturing ? (
          <button onClick={startCapture} style={{ padding: '10px 20px', fontSize: 16 }}>
            Start Sync
          </button>
        ) : (
          <button onClick={stopCapture} style={{ padding: '10px 20px', fontSize: 16 }}>
            Stop Sync
          </button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        <div>
          <h3>Original Feed (Hidden in PROD)</h3>
          <video
            ref={videoRef}
            style={{ width: 400, background: '#000' }}
            muted
            playsInline
          />
        </div>

        <div>
          <h3>Frame Buffer (Debug View)</h3>
          <div ref={debugRef} />
          <p>Resolution: 100x50</p>
        </div>
      </div>
    </div>
  );
}

export default App;
