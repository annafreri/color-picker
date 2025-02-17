import { useRef, useEffect } from "react";

type UserVideoProps = {
  onVideoReady: (video: HTMLVideoElement, rect: DOMRect) => void
}

export default function UserVideo({ onVideoReady }: UserVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      const rect = videoRef.current.getBoundingClientRect();
      onVideoReady(videoRef.current, rect);

      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        })
        .catch((err) => {
          console.error("Error accessing camera:", err);
        });
    }
  }, []);

  return (
    <video
      className="w-full h-50 bg-zinc-300 rounded-2xl"
      ref={videoRef}
    />
  )
}