import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { calibrateImage } from '../utils/calibration';
import { Check, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react';

export const CalibrationStep = () => {
  const { 
    originalImageDataUrl, 
    setCalibration, 
    resetCalibration, 
    isCalibrated, 
    calibratedImageDataUrl,
    setStep
  } = useAppStore();
  
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse/Loupe state
  const [mousePos, setMousePos] = useState<{x: number, y: number} | null>(null);
  const [loupeData, setLoupeData] = useState<ImageData | null>(null);

  useEffect(() => {
    if (!originalImageDataUrl || isCalibrated) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas display size to fit container width while maintaining aspect ratio
      const containerWidth = containerRef.current?.clientWidth || 800;
      const ratio = img.height / img.width;
      
      // Actual internal resolution vs display size
      // For picking pixels, it's easier if display resolution == internal resolution 
      // or we properly map coordinates.
      // Let's constrain internal resolution to reasonable bounds to avoid lag.
      const maxWidth = 1200;
      let targetWidth = img.width;
      let targetHeight = img.height;
      if (targetWidth > maxWidth) {
        targetWidth = maxWidth;
        targetHeight = maxWidth * ratio;
      }
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    };
    img.src = originalImageDataUrl;
  }, [originalImageDataUrl, isCalibrated]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCalibrated) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    setMousePos({ x: e.clientX, y: e.clientY });

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Get 5x5 area for loupe
      try {
        const area = ctx.getImageData(x - 2, y - 2, 5, 5);
        setLoupeData(area);
      } catch (e) {
        // Ignore cross-origin canvas errors if any
      }
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
  };

  const handleCanvasClick = async (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCalibrated || isProcessing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsProcessing(true);
    setError(null);
    setMousePos(null);

    try {
      const result = await calibrateImage(canvas.toDataURL('image/png'), { x, y });
      setCalibration({x, y}, result.rgb, result.blob, result.dataUrl);
    } catch (err: any) {
      setError(err.message || 'Kalibrasyon hatası');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!originalImageDataUrl) return null;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      <div className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Beyaz Dengesi Zorunlu Kalibrasyon</h2>
          <p className="text-sm text-white/50">
            {isCalibrated 
              ? "Kalibrasyon tamamlandı. Sonucu kontrol edin." 
              : "Lütfen fotoğraftaki beyaz veya ışık alan en açık renge tıklayın."}
          </p>
        </div>
        
        {isCalibrated && (
          <div className="flex gap-3">
            <button 
              onClick={resetCalibration}
              className="px-4 py-2 rounded-xl flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Tekrar Seç</span>
            </button>
            <button 
              onClick={() => setStep(3)}
              className="px-6 py-2 rounded-xl flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity font-medium shadow-lg shadow-primary/20"
            >
              <span>Onayla ve Devam Et</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div 
        ref={containerRef}
        className={`glass-card p-4 relative overflow-hidden flex justify-center ${
          !isCalibrated && !isProcessing ? 'cursor-crosshair' : ''
        }`}
      >
        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-medium animate-pulse">Pikseller işleniyor...</p>
          </div>
        )}

        {isCalibrated && calibratedImageDataUrl ? (
          // Comparison View (Simple approach without slider for now to ensure stability, just showing result)
          <div className="w-full flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2">
              <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-semibold mb-2 ml-2">Öncesi</span>
              <img src={originalImageDataUrl} alt="Original" className="w-full rounded-lg" />
            </div>
            <div className="w-full sm:w-1/2">
              <span className="inline-block px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold mb-2 ml-2">Kalibre Edilmiş Sonuç</span>
              <img src={calibratedImageDataUrl} alt="Calibrated" className="w-full rounded-lg shadow-2xl" />
            </div>
          </div>
        ) : (
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="w-full h-auto max-h-[70vh] object-contain rounded-lg shadow-lg"
          />
        )}

        {/* Loupe */}
        {!isCalibrated && mousePos && loupeData && !isProcessing && (
          <div 
            className="fixed pointer-events-none z-50 w-24 h-24 rounded-full border-2 border-white bg-black/50 shadow-2xl overflow-hidden flex items-center justify-center transform -translate-x-1/2 -translate-y-[120%]"
            style={{ left: mousePos.x, top: mousePos.y }}
          >
            {/* Crosshair in the middle */}
            <div className="absolute inset-0 m-auto w-1 h-1 bg-red-500 rounded-full z-10" />
            
            {/* Draw the 5x5 as a highly scaled grid using an inner canvas or div grid */}
            <div className="grid grid-cols-5 grid-rows-5 w-full h-full scale-[1.2]">
              {Array.from({ length: 25 }).map((_, i) => {
                const r = loupeData.data[i * 4];
                const g = loupeData.data[i * 4 + 1];
                const b = loupeData.data[i * 4 + 2];
                return (
                  <div 
                    key={i} 
                    style={{ backgroundColor: `rgb(${r},${g},${b})` }}
                    className="w-full h-full border border-black/10"
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
