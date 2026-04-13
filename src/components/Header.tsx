import { useAppStore } from '../store/appStore';
import { Camera } from 'lucide-react';

export const Header = () => {
  const { currentStep } = useAppStore();

  return (
    <header className="border-b border-white/10 bg-backgroundLighter/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              Tekstil AI Studio
            </h1>
            <p className="text-xs text-white/50 hidden sm:block">
              Fal.ai Nano Banana Pro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-white/60 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span>Adım {currentStep} / 4</span>
        </div>
      </div>
    </header>
  );
};
