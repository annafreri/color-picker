import { Copy, Info, PaintBucket } from "lucide-react";
import UserVideo from "./components/UserVideo";
import { useRef, useState } from "react";
import { Button } from "./components/ui/button";

// RGB to Hex conversion function
const rgbToHex = (r: number, g: number, b: number): string => {
  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('');
};

type color = Record<string, number>

function App() {

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLCanvasElement | null>(null);

  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null);
  const [videoRect, setVideoRect] = useState<DOMRect | null>(null);
  const [color, setcolor] = useState<color | null>(null);
  const [userColors, setUserColors] = useState<color[] | null>(null);

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
      setcolor({
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

  const onCanvasClick = () => {
    setUserColors([color ?? {}, ...userColors ?? []])
    console.log(userColors)
  }

  const hexColor = rgbToHex(color?.r ?? 0, color?.g ?? 0, color?.b ?? 0)

  return (
    <>
      <div className="sm:w-1/2 md:w-1/3 h-full bg-zinc-900 mx-8 md:mx-auto my-8 rounded-2xl flex flex-col gap-6 px-8 py-6 text-zinc-400">
        <div className="flex justify-between items-center">

          <div className="flex flex-row gap-3 items-center">
            <PaintBucket />
            <h1 className="font-semibold text-2xl">Life to hex</h1>
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
            className="absolute top-0 left-0 w-full h-50 cursor-crosshair"
            style={{ opacity: 0 }}
            onMouseMove={handleMouseMove}
            onClick={onCanvasClick}
          />

          {/* Visible canvas for preview */}
          <canvas
            ref={previewRef}
            width={videoRect?.width || 300}
            height={videoRect?.height || 150}
            className="absolute top-0 left-0 w-full h-50 pointer-events-none"
          />

        </div>

        {color && (
          <div className="flex flex-col w-full gap-8 text-zinc-500">


            <div>
              <div className="flex flex-row gap-4 items-center">
                <div
                  className="w-9 h-9 rounded-lg border"
                  style={{
                    backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})`
                  }}
                />
                <div className="block">
                  {/* <p className="font-mono">
                    RGB: {color.r}, {color.g}, {color.b}
                  </p> */}
                  <p
                    className="font-mono text-4xl"
                  >
                    {hexColor}
                  </p>
                </div>
                <Button onClick={() => { navigator.clipboard.writeText(hexColor) }} >
                  <Copy />
                </Button>
              </div>
              <h2 className="mt-5">Your palette</h2>
              <div
                className="flex flex-wrap mt-6 gap-2 text-zinc-600 font-mono">

                {
                  userColors && userColors.map((color, index) => {
                    const hexCode = rgbToHex(color?.r ?? 0, color?.g ?? 0, color?.b ?? 0)
                    return (
                      <div
                        key={`${index} +${color.r}  `}
                        className="cursor-pointer flex grow flex-row gap-2 items-center border-1 border-zinc-800 hover:bg-zinc-800 rounded-full px-2 py-1 transition-all"
                      >
                        <div
                          className="size-4 rounded-full"
                          style={{ backgroundColor: hexCode }}>
                        </div>
                        <p className="text-sm">{hexCode}</p>
                      </div>
                    )
                  })
                }
              </div>
            </div>



          </div>
        )}
      </div>


    </>
  );
}

export default App;