import { useAppStore } from '../store/appStore';
import { Upload, Crosshair, Settings, Sparkles } from 'lucide-react';

const steps = [
  { id: 1, title: 'Yükle', icon: Upload },
  { id: 2, title: 'Kalibrasyon', icon: Crosshair },
  { id: 3, title: 'Parametreler', icon: Settings },
  { id: 4, title: 'Üretim', icon: Sparkles },
];

export const StepIndicator = () => {
  const { currentStep } = useAppStore();

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-4">
      <div className="relative flex justify-between">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-primary to-accent -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        />

        {steps.map((step) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 text-white scale-110' 
                    : isCompleted 
                      ? 'bg-white text-background' 
                      : 'bg-backgroundLighter border-2 border-white/10 text-white/40'
                }`}
              >
                <step.icon className={`w-5 h-5 ${isCompleted ? 'text-green-600' : ''}`} />
              </div>
              <span className={`text-sm font-medium transition-colors ${
                isActive ? 'text-white' : isCompleted ? 'text-white/80' : 'text-white/40'
              }`}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
