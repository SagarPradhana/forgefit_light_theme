import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Trash2, Download, Upload, Loader2 } from "lucide-react";

/* ─── SUCCESS CHECKMARK ─────────────────────────────── */
export function SuccessAnimation({ show, size = 64 }: { show: boolean; size?: number }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 200 }}
          className="relative"
        >
          <motion.div
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          >
            <CheckCircle size={size} className="text-green-500" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── DELETE TO TRASH ANIMATION ─────────────────────── */
export function DeleteAnimation({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="flex flex-col items-center justify-center gap-2 py-6">
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{
              scale: [0, 1.2, 1],
              rotate: [-30, 10, 0],
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              animate={{
                y: [0, -8, 0],
              }}
              transition={{ duration: 0.6, delay: 0.3, repeat: Infinity, repeatDelay: 0.5 }}
            >
              <Trash2 size={48} className="text-red-500" />
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-medium text-red-600"
          >
            Deleting...
          </motion.p>

          {/* Shred particles */}
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={{ y: 0, opacity: 1, x: 0 }}
                animate={{
                  y: [0, -20 - i * 10, -30 - i * 5],
                  x: [0, (i - 1) * 20],
                  opacity: [1, 1, 0],
                  scale: [1, 0.5, 0],
                }}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.1, ease: "easeOut" }}
                className="w-2 h-2 rounded-full bg-red-400"
              />
            ))}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ─── DOWNLOAD PROGRESS ANIMATION ───────────────────── */
export function DownloadAnimation({
  stage,
  size = 48,
}: {
  stage: "idle" | "downloading" | "success";
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {stage === "idle" && <Download size={size} className="text-gray-400" />}

      {stage === "downloading" && (
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <Download size={size} className="text-orange-500" />
          </motion.div>

          {/* Progress bar */}
          <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 font-medium"
          >
            Generating PDF...
          </motion.p>
        </div>
      )}

      {stage === "success" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 150 }}
          className="flex flex-col items-center gap-1"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CheckCircle size={size} className="text-green-500" />
          </motion.div>
          <p className="text-xs font-medium text-green-600">Downloaded!</p>
        </motion.div>
      )}
    </div>
  );
}

/* ─── UPLOAD PROGRESS ANIMATION ─────────────────────── */
export function UploadAnimation({
  stage,
  size = 48,
}: {
  stage: "idle" | "uploading" | "success";
  size?: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {stage === "idle" && <Upload size={size} className="text-gray-400" />}

      {stage === "uploading" && (
        <div className="flex flex-col items-center gap-2">
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <Upload size={size} className="text-orange-500" />
          </motion.div>

          <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
            />
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-gray-500 font-medium"
          >
            Uploading...
          </motion.p>
        </div>
      )}

      {stage === "success" && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 12, stiffness: 150 }}
          className="flex flex-col items-center gap-1"
        >
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CheckCircle size={size} className="text-green-500" />
          </motion.div>
          <p className="text-xs font-medium text-green-600">Uploaded!</p>
        </motion.div>
      )}
    </div>
  );
}

/* ─── SAVING ANIMATION ──────────────────────────────── */
export function SavingAnimation({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="flex flex-col items-center gap-2 py-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={36} className="text-orange-500" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-gray-600"
          >
            Saving...
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── CONFETTI / BURST ──────────────────────────────── */
function ConfettiParticle({
  delay,
  color,
  xSpread,
}: {
  delay: number;
  color: string;
  xSpread: number;
}) {
  return (
    <motion.div
      initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
      animate={{
        x: xSpread,
        y: -40 + Math.random() * -60,
        scale: 0,
        opacity: 0,
      }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={`w-2 h-2 rounded-full absolute ${color}`}
    />
  );
}

export function BurstAnimation({ show }: { show: boolean }) {
  const particles = [
    { delay: 0, color: "bg-orange-400", xSpread: 20 },
    { delay: 0.05, color: "bg-green-400", xSpread: -15 },
    { delay: 0.1, color: "bg-blue-400", xSpread: 25 },
    { delay: 0.15, color: "bg-purple-400", xSpread: -20 },
    { delay: 0.2, color: "bg-pink-400", xSpread: 30 },
    { delay: 0.25, color: "bg-yellow-400", xSpread: -25 },
  ];

  return (
    <AnimatePresence>
      {show && (
        <div className="relative flex items-center justify-center">
          {particles.map((p, i) => (
            <ConfettiParticle key={i} {...p} />
          ))}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.3, 1] }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
          >
            <CheckCircle size={24} className="text-green-500 relative z-10" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
