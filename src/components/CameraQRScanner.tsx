import React, { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import { Camera, X, RefreshCw, AlertTriangle } from "lucide-react";

interface CameraQRScannerProps {
  onScan: (decoded: string) => void;
  onClose: () => void;
  lang: "ur" | "en";
}

export default function CameraQRScanner({ onScan, onClose, lang }: CameraQRScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [camerasPermission, setCamerasPermission] = useState<"pending" | "granted" | "denied">("pending");
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        setCamerasPermission("pending");
        setErrorMsg(null);
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 640 }, height: { ideal: 480 } }
        });
        
        if (!active) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }

        streamRef.current = stream;
        setCamerasPermission("granted");

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute("playsinline", "true");
          videoRef.current.play().catch(e => console.log("video play error:", e));
        }
      } catch (err: any) {
        console.error("Camera access error:", err);
        if (active) {
          setCamerasPermission("denied");
          setErrorMsg(
            lang === "ur"
              ? "کیمرہ تک رسائی نہیں ہو سکی۔ برائے مہربانی اجازت دیں یا نئے ٹیب میں کھولیں۔"
              : "Could not access video camera. Please verify camera permissions or open the preview in a new browser tab directly."
          );
        }
      }
    }

    startCamera();

    return () => {
      active = false;
      stopCamera();
    };
  }, [lang]);

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (camerasPermission !== "granted") return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const scanFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        if (canvas.width !== video.videoWidth) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code && code.data) {
          onScan(code.data);
          stopCamera();
          return;
        }

        const boxSize = Math.min(canvas.width, canvas.height) * 0.6;
        const x = (canvas.width - boxSize) / 2;
        const y = (canvas.height - boxSize) / 2;

        ctx.fillStyle = "rgba(15, 23, 42, 0.45)";
        ctx.fillRect(0, 0, canvas.width, y);
        ctx.fillRect(0, y + boxSize, canvas.width, canvas.height - (y + boxSize));
        ctx.fillRect(0, y, x, boxSize);
        ctx.fillRect(x + boxSize, y, canvas.width - (x + boxSize), boxSize);

        ctx.strokeStyle = "#10B981";
        ctx.lineWidth = 4;
        ctx.strokeRect(x, y, boxSize, boxSize);

        const cornerLen = 20;
        ctx.strokeStyle = "#F59E0B";
        ctx.lineWidth = 6;
        
        ctx.beginPath();
        ctx.moveTo(x - 3, y + cornerLen);
        ctx.lineTo(x - 3, y - 3);
        ctx.lineTo(x + cornerLen, y - 3);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + boxSize + 3, y + cornerLen);
        ctx.lineTo(x + boxSize + 3, y - 3);
        ctx.lineTo(x + boxSize - cornerLen, y - 3);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x - 3, y + boxSize - cornerLen);
        ctx.lineTo(x - 3, y + boxSize + 3);
        ctx.lineTo(x + cornerLen, y + boxSize + 3);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(x + boxSize + 3, y + boxSize - cornerLen);
        ctx.lineTo(x + boxSize + 3, y + boxSize + 3);
        ctx.lineTo(x + boxSize - cornerLen, y + boxSize + 3);
        ctx.stroke();

        const pulseY = y + (Math.sin(Date.now() / 150) * 0.5 + 0.5) * boxSize;
        ctx.strokeStyle = "rgba(239, 68, 68, 0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x + 5, pulseY);
        ctx.lineTo(x + boxSize - 5, pulseY);
        ctx.stroke();
      }

      animationFrameRef.current = requestAnimationFrame(scanFrame);
    };

    animationFrameRef.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [camerasPermission]);

  return (
    <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl relative">
        
        <div className="flex justify-between items-center pb-3 border-b border-slate-800">
          <h3 className="font-extrabold text-xs text-white uppercase tracking-tight flex items-center gap-2">
            <Camera className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{lang === "ur" ? "لائیو کیمرہ کیو آر اسکینر" : "Active Camera QR Scanner"}</span>
          </h3>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-950 border border-slate-850 flex items-center justify-center">
          <video
            ref={videoRef}
            style={{ display: "none" }}
            playsInline
            muted
          />

          {camerasPermission === "pending" && (
            <div className="flex flex-col items-center gap-2 text-slate-400 text-xs text-center p-3 animate-pulse">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
              <span>{lang === "ur" ? "کیمرہ شروع کیا جا رہا ہے..." : "Requesting Camera Feed Access..."}</span>
            </div>
          )}

          {camerasPermission === "denied" && (
            <div className="flex flex-col items-center gap-3 p-4 text-center text-rose-450 text-xs">
              <AlertTriangle className="w-7 h-7 text-rose-500 animate-bounce" />
              <p className="font-extrabold text-rose-400">{errorMsg}</p>
              <div className="text-[10px] text-slate-500 leading-normal max-w-xs">
                {lang === "ur"
                  ? "براہ کرم یقینی بنائیں کہ آپ نے کیمرہ کھولنے کی اجازت دی ہے، یا پیج کے اوپر دائیں کونے سے 'اوپن ان نیو ٹیب' پر کلک کریں۔"
                  : "Due to iframe security sandbox, camera stream might be blocked in the micro-preview frame. Open in an absolute new browser tab for camera features!"}
              </div>
            </div>
          )}

          {camerasPermission === "granted" && (
            <canvas
              ref={canvasRef}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="text-center space-y-1 bg-slate-950/60 p-3 rounded-xl border border-slate-850">
          <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
            {lang === "ur" ? "میز کا کیو آر کوڈ اسکین کریں" : "Center Table Printed QR Sticker"}
          </p>
          <p className="text-[9.5px] text-slate-500 leading-relaxed font-semibold">
            {lang === "ur"
              ? "اسکینڈ کرنے پر یہ خودکار طور پر اس میز کی آرڈر اسکرین پر لے جائے گا۔"
              : "Scanning instantly routes dashboard to that active dining portal."}
          </p>
        </div>

      </div>
    </div>
  );
}
