import { useAppStore, type AspectRatio, type ProductForm, type SceneStyle } from '../store/appStore';
import { buildPrompt } from '../constants/prompts';
import { ArrowRight, Info } from 'lucide-react';

const productFormOptions: Array<{ value: ProductForm; label: string }> = [
  { value: 'flat_lay', label: 'Düz Zemin (Flat Lay)' },
  { value: 'folded', label: 'Katlı (Folded)' },
  { value: 'hanging', label: 'Askıda (Hanging)' },
  { value: 'mannequin', label: 'Görünmez Manken (Ghost Mannequin)' },
  { value: 'styled_flat_lay', label: 'Kombinli Düz Zemin (Styled Flat Lay)' },
];

const sceneStyleOptions: Array<{ value: SceneStyle; label: string }> = [
  { value: 'minimalist_studio', label: 'Minimalist Studio' },
  { value: 'scandinavian', label: 'İskandinav Ev' },
  { value: 'cafe', label: 'Kahve Dükkanı' },
  { value: 'outdoor', label: 'Doğa / Outdoor' },
  { value: 'hotel', label: 'Otel Odası' },
  { value: 'loft', label: 'Endüstriyel Loft' },
  { value: 'beach', label: 'Plaj / Sahil' },
  { value: 'office', label: 'Modern Ofis' },
];

const aspectRatioOptions: AspectRatio[] = ['1:1', '4:5', '3:4', '9:16', '16:9'];
const resolutionOptions: Array<'1K' | '2K' | '4K'> = ['1K', '2K', '4K'];

export const ParameterStep = () => {
  const { 
    calibratedImageDataUrl, 
    productForm, 
    sceneStyle, 
    aspectRatio, 
    resolution, 
    customRequest,
    updateParameters,
    setStep
  } = useAppStore();

  const generatedPrompt = buildPrompt(productForm, sceneStyle, customRequest);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
      {/* Left side: Preview */}
      <div className="w-full lg:w-1/3 flex flex-col gap-4">
        <div className="glass-card p-4">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">
            Kalibre Edilmiş Kaynak
          </h3>
          <img 
            src={calibratedImageDataUrl || ''} 
            alt="Source" 
            className="w-full h-auto rounded-lg shadow-lg border border-white/5"
          />
        </div>

        <div className="glass-card p-5 border-primary/20 bg-primary/5">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-primary mb-1">Maliyet Tahmini</h4>
              <p className="text-xs text-white/70">
                {resolution === '4K' ? '$0.30' : '$0.15'} / varyasyon
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Parameters */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col gap-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Form */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/80">Ürün Formu</label>
              <select 
                value={productForm}
                onChange={(e) => updateParameters({ productForm: e.target.value as ProductForm })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                {productFormOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Scene Style */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/80">Sahne Stili</label>
              <select 
                value={sceneStyle}
                onChange={(e) => updateParameters({ sceneStyle: e.target.value as SceneStyle })}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                {sceneStyleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Aspect Ratio */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/80">Çıktı Oranı</label>
              <div className="flex flex-wrap gap-2">
                {aspectRatioOptions.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => updateParameters({ aspectRatio: ratio })}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                      aspectRatio === ratio 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : 'bg-black/40 text-white/60 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            {/* Resolution */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/80">Çözünürlük</label>
              <div className="flex gap-2">
                {resolutionOptions.map((res) => (
                  <button
                    key={res}
                    onClick={() => updateParameters({ resolution: res })}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors border ${
                      resolution === res 
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                        : 'bg-black/40 text-white/60 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {res} {res === '4K' && <span className="text-[10px] opacity-70 ml-1">(2x 💰)</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-white/80">Özel İstek (Opsiyonel)</label>
            <textarea 
              value={customRequest}
              onChange={(e) => updateParameters({ customRequest: e.target.value })}
              placeholder="Örn: Yanında bir kahve fincanı olsun, ışık daha sıcak tonlarda olsun..."
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none h-24"
            />
          </div>

          {/* Live Prompt Preview */}
          <div className="bg-black/60 rounded-xl p-4 border border-white/5">
            <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wide mb-2">
              Oluşturulan Prompt (Geliştirici Önizleme)
            </h4>
            <p className="text-xs text-white/70 font-mono leading-relaxed opacity-80">
              {generatedPrompt}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            onClick={() => setStep(4)}
            className="px-8 py-3 rounded-xl flex items-center gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity font-medium shadow-lg shadow-primary/20 text-lg group"
          >
            <span>Sahneyi Oluştur</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
