import { useEffect } from 'react';
import { useAppStore } from './store/appStore';
import { Header } from './components/Header';
import { StepIndicator } from './components/StepIndicator';
import { UploadStep } from './components/UploadStep';
import { CalibrationStep } from './components/CalibrationStep';
import { ParameterStep } from './components/ParameterStep';
import { GenerationStep } from './components/GenerationStep';

function App() {
  const { currentStep } = useAppStore();

  // Warn before leaving page to prevent data loss
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = ''; // Standard way to show native browser warning
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 pb-20">
        <StepIndicator />
        
        <div className="mt-8 animate-fade-in relative">
          {currentStep === 1 && <UploadStep />}
          {currentStep === 2 && <CalibrationStep />}
          {currentStep === 3 && <ParameterStep />}
          {currentStep === 4 && <GenerationStep />}
        </div>
      </main>
    </div>
  );
}

export default App;
