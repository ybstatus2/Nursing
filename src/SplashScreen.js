import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    setShowContent(true);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setTimeout(() => onFinish?.(), 300);
          return 100;
        }
        return p + Math.random() * 30;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <div className={`h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 transition-opacity duration-500 ${showContent ? 'opacity-100' : 'opacity-0'}`}>
      {/* Animated Logo */}
      <div className="relative mb-8">
        <div className="absolute inset-0 w-28 h-28 bg-blue-500/20 rounded-full animate-ping" />
        <div className="absolute inset-0 w-28 h-28 bg-blue-500/10 rounded-full animate-pulse" />
        <div className="relative w-28 h-28 bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 transform hover:scale-105 transition-transform">
          <span className="text-5xl font-black text-white">R</span>
        </div>
      </div>

      {/* Brand Name */}
      <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2 tracking-tight">
        RPREP
      </h1>
      <p className="text-gray-400 text-base font-medium mb-8">CBT Exam Prep</p>

      {/* Progress Bar */}
      <div className="w-48 h-1.5 bg-gray-700 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Loading Text */}
      <p className="text-gray-500 text-sm">Loading your success...</p>

      {/* Version */}
      <p className="absolute bottom-8 text-gray-600 text-xs">v1.0</p>
    </div>
  );
}
