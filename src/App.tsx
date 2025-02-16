import { Info, PaintBucket } from "lucide-react";
import UserVideo from "./components/UserVideo";
import { useRef, useState } from "react";

// RGB to Hex conversion function
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
};

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [videoRect, setVideoRect] = useState<DOMRect | null>(null);
  const [colors, setColors] = useState<{ r: number; g: number; b: number; } | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasRef.current && videoEl && previewRef.current) {
      const ctx = canvasRef.current.getContext('2d');

      // Get canvas display size from its CSS
      const rect = canvasRef.current.getBoundingClientRect();

      // Update canvas dimensions to match display size
      previewRef.current.width = rect.width;
      previewRef.current.height = rect.height;

      // Get precise mouse coordinates
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // For color picking, we need to scale coordinates back to video dimensions
      const scaleX = videoEl.videoWidth / rect.width;
      const scaleY = videoEl.videoHeight / rect.height;

      // Draw just a 1x1 pixel area from the video at the scaled coordinates
      ctx?.drawImage(
        videoEl,
        x * scaleX, y * scaleY, 1, 1,
        0, 0, 1, 1
      );

      // Get the pixel data
      const imageData = ctx?.getImageData(0, 0, 1, 1);
      setColors({
        r: imageData?.data[0] || 0,
        g: imageData?.data[1] || 0,
        b: imageData?.data[2] || 0
      });

      // Draw preview at cursor position
      const previewCtx = previewRef.current.getContext('2d');
      if (previewCtx) {
        previewCtx.clearRect(0, 0, rect.width, rect.height);

        // Draw magnification circle
        previewCtx.beginPath();
        previewCtx.arc(x, y, 20, 0, Math.PI * 2);
        previewCtx.strokeStyle = 'white';
        previewCtx.lineWidth = 2;
        previewCtx.stroke();

        // Draw crosshair
        previewCtx.beginPath();
        previewCtx.moveTo(x - 10, y);
        previewCtx.lineTo(x + 10, y);
        previewCtx.moveTo(x, y - 10);
        previewCtx.lineTo(x, y + 10);
        previewCtx.strokeStyle = 'black';
        previewCtx.lineWidth = 1;
        previewCtx.stroke();
      }
    }
  };

  // Update the video ready handler
  const handleVideoReady = (video: HTMLVideoElement, rect: DOMRect) => {
    setVideoEl(video);
    setVideoRect(rect);
  };

  return (
    <div className="sm:w-1/2 md:w-1/3 h-screen bg-zinc-900 mx-8 md:mx-auto my-8 rounded-2xl flex flex-col gap-6 px-8 py-6 text-zinc-400">
      <div className="flex justify-between items-center">

        <div className="flex flex-row gap-3 items-center">
          <PaintBucket />
          <h1 className="font-semibold text-2xl">Color picker</h1>
        </div>

        <Info />

      </div>

      <div className="relative">
        <UserVideo onVideoReady={handleVideoReady} />


        {/* Hidden canvas for color picking */}
        <canvas
          ref={canvasRef}
          width={videoRect?.width || 1}
          height={videoRect?.height || 1}
          className="absolute top-0 left-0 w-full h-80 cursor-crosshair"
          style={{ opacity: 0 }}
          onMouseMove={handleMouseMove}
        />

        {/* Visible canvas for preview */}
        <canvas
          ref={previewRef}
          width={videoRect?.width || 300}
          height={videoRect?.height || 150}
          className="absolute top-0 left-0 w-full h-80 pointer-events-none"
        />

      </div>

      {colors && (

        <div className="flex items-center gap-8 text-zinc-500">
          <div
            className="w-12 h-12 rounded-lg border"
            style={{
              backgroundColor: `rgb(${colors.r}, ${colors.g}, ${colors.b})`
            }}
          />
          <div>
            <p className="font-mono">
              RGB: {colors.r}, {colors.g}, {colors.b}
            </p>
            <p className="font-mono">
              HEX: {rgbToHex(colors.r, colors.g, colors.b)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;