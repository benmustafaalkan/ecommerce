import { useCallback, useState } from 'react';
import { useAppStore } from '../store/appStore';
import { buildPrompt } from '../constants/prompts';
import { CONFIG } from '../constants/config';

interface GeneratedImageResponse {
  url: string;
}

interface GenerateResponse {
  images?: GeneratedImageResponse[];
}

interface UploadResponse {
  url?: string;
  error?: string;
}

export const useGeneration = () => {
  const { 
    calibratedImageBlob,
    calibratedImageDataUrl, 
    productForm,
    sceneStyle,
    aspectRatio,
    resolution,
    outputFormat,
    customRequest,
    isGenerating,
    setGenerating,
    addGeneratedImages,
    setError
  } = useAppStore();

  const [progressText, setProgressText] = useState('');

  const uploadCalibratedImage = useCallback(async (imageBlob: Blob): Promise<string> => {
    const formData = new FormData();
    formData.append('file', imageBlob, 'calibrated-image.png');

    const uploadRes = await fetch(CONFIG.UPLOAD_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    const uploadData: UploadResponse = await uploadRes.json();

    if (!uploadRes.ok || !uploadData.url) {
      if (uploadRes.status === 429) {
        throw new Error('Çok fazla upload isteği. Lütfen 1 dakika sonra tekrar deneyin.');
      }

      throw new Error(uploadData.error || 'Görsel upload edilemedi.');
    }

    return uploadData.url;
  }, []);

  const generate = useCallback(async (numImages: number = 1) => {
    if (!calibratedImageBlob || !calibratedImageDataUrl || isGenerating) return;

    setGenerating(true);
    setError(null);
    setProgressText('Görüntü yükleniyor...');

    try {
      const imageUrl = await uploadCalibratedImage(calibratedImageBlob);

      // 2. Generate Prompt
      const prompt = buildPrompt(productForm, sceneStyle, customRequest);

      // 3. API Request
      setProgressText('Sahne oluşturuluyor... Bu işlem 10-30 saniye sürebilir.');
      const generatePayload = {
        prompt,
        image_urls: [imageUrl],
        aspect_ratio: aspectRatio,
        resolution,
        output_format: outputFormat,
        num_images: numImages
      };

      const generateRes = await fetch(CONFIG.FAL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(generatePayload)
      });

      if (!generateRes.ok) {
        if (generateRes.status === 429) {
          throw new Error('Çok fazla istek. Lütfen 30 saniye bekleyin.');
        }
        throw new Error('Sunucu hatası veya içerik güvenlik filtresine takıldı.');
      }

      const generateData: GenerateResponse = await generateRes.json();
      
      if (!generateData.images || !Array.isArray(generateData.images)) {
        throw new Error('Üretim sonucunda görüntü bulunamadı.');
      }

      const newImages = generateData.images.map((img) => ({
        id: crypto.randomUUID(),
        url: img.url,
        prompt,
        createdAt: Date.now()
      }));

      addGeneratedImages(newImages);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu');
      setGenerating(false);
    }
  }, [
    addGeneratedImages,
    aspectRatio,
    calibratedImageBlob,
    calibratedImageDataUrl,
    customRequest,
    isGenerating,
    outputFormat,
    productForm,
    resolution,
    sceneStyle,
    setError,
    setGenerating,
    uploadCalibratedImage,
  ]);

  return { generate, progressText };
};
