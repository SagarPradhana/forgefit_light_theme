import { useEffect, useRef, useState, useCallback } from "react";
import { Modal } from "../../ui/primitives";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "../../../store/toastStore";
import { api } from "../../../utils/httputils";
import { CheckCircle, XCircle, Camera, RefreshCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function QRScannerModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  
  type ScanStatus = "scanning" | "processing" | "success" | "error";
  const [scanStatus, setScanStatus] = useState<ScanStatus>("scanning");
  
  // Synchronous lock to prevent fast-firing callback loops
  const isProcessingRef = useRef(false);
  
  const [errorMessage, setErrorMessage] = useState("");
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  
  const lastScanned = useRef<string | null>(null);
  const lastScannedTime = useRef<number>(0);
  
  const containerId = "admin-qr-reader";

  const startScanner = useCallback(async (mode: "environment" | "user") => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      }
      
      const scanner = new Html5Qrcode(containerId);
      scannerRef.current = scanner;
      
      await scanner.start(
        { facingMode: mode },
        { 
          fps: 10, 
          qrbox: { width: 300, height: 300 },
          aspectRatio: 1.0 
        },
        (decodedText) => {
          if (isProcessingRef.current) return;
          
          const now = Date.now();
          // Prevent scanning exact same code within 5 seconds to avoid back-to-back identical scans
          if (lastScanned.current === decodedText && now - lastScannedTime.current < 5000) {
             return; 
          }
          
          isProcessingRef.current = true; // Lock immediately!
          lastScanned.current = decodedText;
          lastScannedTime.current = now;
          
          if (scannerRef.current?.pause) {
            try { scannerRef.current.pause(true); } catch (e) {}
          }
          
          setScannedData(decodedText);
          handleScannedUrl(decodedText);
        },
        () => {} // ignore empty frames silently
      );
      setIsScanning(true);
    } catch (err) {
      toast.error("Failed to start camera. Please check permissions.");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setScanStatus("scanning");
      setScannedData(null);
      setErrorMessage("");
      isProcessingRef.current = false;
      lastScanned.current = null;
      lastScannedTime.current = 0;
      
      setTimeout(() => {
        startScanner(facingMode);
      }, 300);
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error).finally(() => {
          scannerRef.current?.clear();
        });
      }
      setIsScanning(false);
    };
  }, [isOpen]); 

  const toggleCamera = async () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    await startScanner(newMode);
  };

  const handleScannedUrl = async (url: string) => {
    try {
      setScanStatus("processing");
      
      let targetUrl = url;
      try {
        const urlObj = new URL(url);
        targetUrl = urlObj.pathname;
      } catch (e) {}
      
      // api.post automatically checks for !response.ok and throws an error if status is 4xx or 5xx.
      // We pass { showToast: false } so it does NOT show a global message toaster.
      await api.post(targetUrl, {}, { showToast: false });
      
      // If we reach here, it's a success (e.g. 200, 201)
      setScanStatus("success");
      
      // Auto-resume to normal camera mode after short delay
      setTimeout(() => {
         setScanStatus("scanning");
         setScannedData(null);
         isProcessingRef.current = false; // Unlock for next scan
         if (scannerRef.current?.resume) {
           try { scannerRef.current.resume(); } catch(e) {}
         }
      }, 2500);
      
    } catch (err: any) {
      const errMessage = err?.message || err?.error || err?.errors?.[0]?.msg || "Invalid QR Code or Request Failed";
      setErrorMessage(errMessage);
      setScanStatus("error");
      
      // Auto-resume after showing error message
      setTimeout(() => {
        setScanStatus("scanning");
        setScannedData(null);
        setErrorMessage("");
        isProcessingRef.current = false; // Unlock for next scan
        if (scannerRef.current?.resume) {
           try { scannerRef.current.resume(); } catch(e) {}
        }
      }, 3500);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} title="Scan ID Card">
      <div className="flex flex-col items-center justify-center p-4 min-h-[500px] w-[95vw] sm:w-[600px] max-w-full overflow-hidden relative">
        
        <div className="w-full flex flex-col items-center">
          <div className="w-full max-w-lg rounded-2xl overflow-hidden border-2 border-indigo-500/50 relative shadow-[0_0_20px_rgba(99,102,241,0.2)] bg-black aspect-square flex items-center justify-center">
             
             {/* The raw empty div for html5-qrcode. DO NOT PUT REACT CHILDREN INSIDE THIS! */}
             <div id={containerId} className="w-full h-full absolute inset-0" />
             
             {/* GPU Accelerated Scanner line */}
             {scanStatus === "scanning" && (
               <div className="absolute inset-0 z-10 pointer-events-none">
                 <div className="scan-line-animator absolute top-0 left-0 w-full h-full">
                   <div className="w-full h-[3px] bg-indigo-500 absolute top-0 shadow-[0_0_20px_#6366f1,0_0_40px_#6366f1]" />
                 </div>
               </div>
             )}
          </div>
          
          <div className="flex items-center justify-between w-full max-w-lg mt-6">
             <p className="text-sm font-bold text-[var(--text-muted)] flex items-center gap-2">
               <Camera size={16} /> Align QR Code within frame
             </p>
             <button 
               onClick={toggleCamera}
               className="flex items-center gap-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-sm border border-[var(--border-subtle)]"
             >
               <RefreshCcw size={14} /> Flip Camera
             </button>
          </div>
        </div>

        {/* Overlay screens (processing, success, error) */}
        <AnimatePresence mode="wait">
          {scanStatus !== "scanning" && (
             <motion.div 
               key={scanStatus}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.95 }}
               className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950/90 to-slate-950 backdrop-blur-md rounded-b-2xl p-6"
             >
                {scanStatus === "processing" && (
                   <div className="flex flex-col items-center justify-center w-full">
                      <div className="h-20 w-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6 shadow-[0_0_30px_rgba(99,102,241,0.2)]" />
                      <p className="text-base font-black text-indigo-400 uppercase tracking-widest animate-pulse">Processing ID...</p>
                   </div>
                )}

                {scanStatus === "success" && (
                  <div className="flex flex-col items-center justify-center text-center w-full">
                    <div className="h-32 w-32 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-emerald-500/30 shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                      <CheckCircle size={64} />
                    </div>
                    <p className="text-3xl font-black text-white mb-3 tracking-tight">Attendance Logged!</p>
                    <p className="text-base text-slate-400 break-all mb-4">Ready for next scan.</p>
                  </div>
                )}

                {scanStatus === "error" && (
                  <div className="flex flex-col items-center justify-center text-center w-full max-w-lg">
                    <div className="w-full rounded-2xl border-2 border-red-500 bg-red-500/10 p-8 shadow-[0_0_50px_rgba(239,68,68,0.25)]">
                      <div className="h-20 w-20 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/30">
                        <XCircle size={40} />
                      </div>
                      <p className="text-2xl font-black text-white mb-3 uppercase tracking-widest">Scan Rejected</p>
                      <p className="text-lg text-red-400 font-bold break-words">{errorMessage}</p>
                    </div>
                  </div>
                )}
             </motion.div>
          )}
        </AnimatePresence>

      </div>
      <style>{`
        /* Force the video feed to fill the box without black bars */
        #admin-qr-reader {
          border: none !important;
        }
        #admin-qr-reader video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 1rem !important;
        }
        /* GPU-accelerated scan animation */
        .scan-line-animator {
          animation: sweep 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          will-change: transform;
        }
        @keyframes sweep {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(calc(100% - 3px)); }
        }
      `}</style>
    </Modal>
  );
}
