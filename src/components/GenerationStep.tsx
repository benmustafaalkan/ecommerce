import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { useGeneration } from '../hooks/useGeneration';
import { Download, RefreshCw, Layers, AlertCircle } from 'lucide-react';
import { downloadImage } from '../utils/imageHelpers';

export const GenerationStep = () => {
  const { 
    isGenerating, 
    generatedImages, 
    error, 
    sceneStyle, 
    aspectRatio,
    sessionHistory
  } = useAppStore();
  
  const { generate, progressText } = useGeneration();

  // Auto-start generation if we haven't generated anything yet in this session
  // Wait, better to let the user manually click it the first time? 
  // Step 3 ends with "Sahneyi Oluştur" button which should probably trigger it.
  // Actually, since there's no generate call in step 3, we should trigger it on mount of step 4 if empty.
  useEffect(() => {
    if (generatedImages.length === 0 && !isGenerating && !error) {
      void generate(1);
    }
  }, [error, generate, generatedImages.length, isGenerating]);

  const handleDownload = (url: string, imageId: string) => {
    const filename = `urun-${sceneStyle}-${aspectRatio.replace(':', 'x')}-${imageId}.png`;
    downloadImage(url, filename);
  };

  return (
    <div className="w-full flex flex-col md:flex-row gap-6">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col gap-6">
        {error && (
          <div className="glass-card p-4 bg-red-500/10 border-red-500/20 flex flex-col items-center justify-center text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
            <h3 className="text-xl font-semibold text-red-400 mb-2">Hata Oluştu</h3>
            <p className="text-red-300/80 mb-6">{error}</p>
            <button 
              onClick={() => generate(1)}
              className="px-6 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-100 transition-colors border border-red-500/30 font-medium"
            >
              Tekrar Dene
            </button>
          </div>
        )}

        {isGenerating ? (
          <div className="glass-card p-16 flex flex-col items-center justify-center text-center flex-1 min-h-[400px]">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full mix-blend-screen animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-semibold mb-2">Yapay Zeka Çalışıyor</h3>
            <p className="text-white/60 mb-1 max-w-md">{progressText}</p>
            <p className="text-xs text-primary mt-4 font-mono font-medium tracking-widest uppercase">
              Kalibretilmiş Piksel Verisi Korunuyor
            </p>
          </div>
        ) : (
          generatedImages.length > 0 && (
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-end">
                <h3 className="text-xl font-semibold">Oluşturulan Görseller</h3>
                <div className="flex gap-3">
                  <button 
                    onClick={() => generate(1)}
                    className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span className="hidden sm:inline">Yeniden Üret</span>
                  </button>
                  <button 
                    onClick={() => generate(2)}
                    className="px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 border border-primary/30 text-primary text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <Layers className="w-4 h-4" />
                    <span>+2 Varyasyon</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {generatedImages.map((img) => (
                  <div key={img.id} className="glass-card overflow-hidden group relative">
                    <img 
                      src={img.url} 
                      alt="Generated Result" 
                      className="w-full aspect-auto object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <button 
                        onClick={() => handleDownload(img.url, img.id)}
                        className="w-full py-3 rounded-xl bg-white text-background font-semibold flex items-center justify-center gap-2 hover:bg-white/90 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-xl"
                      >
                        <Download className="w-5 h-5" />
                        İndir Yüksek Çözünürlük
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* Sidebar: Session History */}
      {sessionHistory.length > 0 && (
        <div className="w-full md:w-64 glass-card p-4 flex flex-col h-fit sticky top-20">
          <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
            Oturum Geçmişi
          </h4>
          <div className="grid grid-cols-2 gap-2 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
            {sessionHistory.map((item) => (
              <div 
                key={item.id} 
                className="relative rounded-lg overflow-hidden border border-white/10 cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => handleDownload(item.url, item.id)}
              >
                <img src={item.url} alt="History thumbnail" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Download className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-white/40 mt-4 text-center">
            Sayfa yenilendiğinde bu geçmiş silinir.
          </p>
        </div>
      )}
    </div>
  );
};
