import { create } from 'zustand';

export type ProductForm =
  | 'folded' | 'hanging' | 'flat_lay'
  | 'mannequin' | 'styled_flat_lay';

export type SceneStyle =
  | 'minimalist_studio' | 'scandinavian'
  | 'cafe' | 'outdoor' | 'hotel'
  | 'loft' | 'beach' | 'office';

export type AspectRatio =
  | '1:1' | '4:5' | '3:4' | '9:16' | '16:9';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: number;
}

export interface AppState {
  currentStep: 1 | 2 | 3 | 4;

  // Step 1: Upload
  originalImage: File | null;
  originalImageDataUrl: string | null;

  // Step 2: Calibration
  calibrationPoint: { x: number; y: number } | null;
  referenceRGB: { r: number; g: number; b: number } | null;
  calibratedImageBlob: Blob | null;
  calibratedImageDataUrl: string | null;
  isCalibrated: boolean;

  // Step 3: Parameters
  productForm: ProductForm;
  sceneStyle: SceneStyle;
  aspectRatio: AspectRatio;
  resolution: '1K' | '2K' | '4K';
  outputFormat: 'png' | 'jpeg' | 'webp';
  customRequest: string;

  // Step 4: Generation
  isGenerating: boolean;
  generatedImages: GeneratedImage[];
  sessionHistory: GeneratedImage[];
  error: string | null;

  // Actions
  setStep: (step: 1 | 2 | 3 | 4) => void;
  setOriginalImage: (file: File, dataUrl: string) => void;
  setCalibration: (point: {x: number, y: number}, rgb: {r: number, g: number, b: number}, blob: Blob, dataUrl: string) => void;
  resetCalibration: () => void;
  updateParameters: (params: Partial<AppState>) => void;
  setGenerating: (isGenerating: boolean) => void;
  addGeneratedImages: (images: GeneratedImage[]) => void;
  setError: (error: string | null) => void;
  resetSession: () => void;
}

const initialState = {
  currentStep: 1 as const,
  originalImage: null,
  originalImageDataUrl: null,
  calibrationPoint: null,
  referenceRGB: null,
  calibratedImageBlob: null,
  calibratedImageDataUrl: null,
  isCalibrated: false,
  productForm: 'flat_lay' as ProductForm,
  sceneStyle: 'minimalist_studio' as SceneStyle,
  aspectRatio: '1:1' as AspectRatio,
  resolution: '1K' as const,
  outputFormat: 'png' as const,
  customRequest: '',
  isGenerating: false,
  generatedImages: [],
  sessionHistory: [],
  error: null,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setStep: (step) => set({ currentStep: step }),
  
  setOriginalImage: (file, dataUrl) => 
    set({ 
      originalImage: file, 
      originalImageDataUrl: dataUrl,
      currentStep: 2,
      // reset inner steps
      calibrationPoint: null,
      referenceRGB: null,
      calibratedImageBlob: null,
      calibratedImageDataUrl: null,
      isCalibrated: false,
    }),

  setCalibration: (point, rgb, blob, dataUrl) =>
    set({
      calibrationPoint: point,
      referenceRGB: rgb,
      calibratedImageBlob: blob,
      calibratedImageDataUrl: dataUrl,
      isCalibrated: true,
    }),
    
  resetCalibration: () =>
    set({
      calibrationPoint: null,
      referenceRGB: null,
      calibratedImageBlob: null,
      calibratedImageDataUrl: null,
      isCalibrated: false,
    }),

  updateParameters: (params) => set((state) => ({ ...state, ...params })),

  setGenerating: (isGenerating) => set({ isGenerating }),

  addGeneratedImages: (images) => 
    set((state) => ({ 
      generatedImages: images,
      sessionHistory: [...state.sessionHistory, ...images],
      isGenerating: false,
      error: null
    })),

  setError: (error) => set({ error, isGenerating: false }),
  
  resetSession: () => set(initialState),
}));
