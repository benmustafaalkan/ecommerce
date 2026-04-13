import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { buildPrompt } from '../constants/prompts';
import { CONFIG } from '../constants/config';

export const useGeneration = () => {
  const { 
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

  const generate = async (numImages: number = 1) => {
    if (!calibratedImageDataUrl || isGenerating) return;

    setGenerating(true);
    setError(null);
    setProgressText('Görüntü yükleniyor...');

    try {
      // Use the Data URL directly instead of a separate upload proxy
      // since the canvas resolution is controlled and will be < 5MB
      const imageUrl = calibratedImageDataUrl;

      if (!imageUrl) throw new Error('Görüntü verisi bulunamadı.');

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

      const generateData = await generateRes.json();
      
      if (!generateData.images || !Array.isArray(generateData.images)) {
        throw new Error('Üretim sonucunda görüntü bulunamadı.');
      }

      const newImages = generateData.images.map((img: any) => ({
        id: crypto.randomUUID(),
        url: img.url,
        prompt,
        createdAt: Date.now()
      }));

      addGeneratedImages(newImages);

    } catch (err: any) {
      setError(err.message || 'Bilinmeyen bir hata oluştu');
      setGenerating(false);
    }
  };

  return { generate, progressText };
};
