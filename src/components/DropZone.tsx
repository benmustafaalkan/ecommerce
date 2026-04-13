import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { validateFile, fileToDataUrl } from '../utils/imageHelpers';
import { UploadCloud, Image as ImageIcon, AlertCircle, X } from 'lucide-react';

export const DropZone = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { setOriginalImage } = useAppStore();

  const handleFile = async (file: File) => {
    setLocalError(null);
    const error = validateFile(file);
    if (error) {
      setLocalError(error);
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setOriginalImage(file, dataUrl);
    } catch {
      setLocalError('Dosya okunurken bir hata oluştu.');
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      void handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      void handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {localError && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-between text-red-400">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{localError}</p>
          </div>
          <button onClick={() => setLocalError(null)} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`glass-card p-12 text-center transition-all duration-300 border-2 border-dashed ${
          isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center border border-white/5 shadow-inner">
          <UploadCloud className={`w-10 h-10 transition-colors duration-300 ${isDragging ? 'text-primary' : 'text-white/60'}`} />
        </div>
        
        <h2 className="text-2xl font-semibold mb-3">Fotoğraf Yükle</h2>
        <p className="text-white/50 mb-8 max-w-sm mx-auto">
          Sürükleyip bırakın veya bilgisayarınızdan seçin. JPG, PNG veya WEBP (Maks 20MB)
        </p>

        <label className="relative overflow-hidden inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-background font-medium hover:bg-white/90 active:scale-95 transition-all cursor-pointer shadow-lg shadow-white/10 group">
          <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Dosya Seç</span>
          <input 
            type="file" 
            className="hidden" 
            accept="image/jpeg,image/png,image/webp" 
            onChange={onFileInput}
          />
        </label>
      </div>

      {/* Feature Highilights */}
      <div className="grid grid-cols-3 gap-6 mt-12 text-center opacity-70">
        <div>
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center border border-white/5">🎯</div>
          <h3 className="font-medium text-sm mb-1">Piksel Hassasiyeti</h3>
          <p className="text-xs text-white/50">Doku ve form korunur</p>
        </div>
        <div>
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center border border-white/5">🎨</div>
          <h3 className="font-medium text-sm mb-1">Renk Kalibrasyonu</h3>
          <p className="text-xs text-white/50">Zorunlu beyaz dengesi</p>
        </div>
        <div>
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center border border-white/5">⚡</div>
          <h3 className="font-medium text-sm mb-1">Hızlı Üretim</h3>
          <p className="text-xs text-white/50">Saniyeler içinde sonuç</p>
        </div>
      </div>
    </div>
  );
};
