export const calibrateImage = async (
  imageDataUrl: string,
  referencePoint: { x: number; y: number }
): Promise<{ blob: Blob; dataUrl: string; rgb: { r: number; g: number; b: number } }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not supported'));

      ctx.drawImage(img, 0, 0);

      try {
        // Read 3x3 area around reference point
        const radius = 1;
        const xStart = Math.max(0, referencePoint.x - radius);
        const yStart = Math.max(0, referencePoint.y - radius);
        const width = Math.min(img.width - xStart, radius * 2 + 1);
        const height = Math.min(img.height - yStart, radius * 2 + 1);

        const sampleData = ctx.getImageData(xStart, yStart, width, height).data;
        
        let rSum = 0, gSum = 0, bSum = 0;
        const pixelCount = width * height;
        
        for (let i = 0; i < sampleData.length; i += 4) {
          rSum += sampleData[i];
          gSum += sampleData[i + 1];
          bSum += sampleData[i + 2];
        }

        const rRef = Math.round(rSum / pixelCount);
        const gRef = Math.round(gSum / pixelCount);
        const bRef = Math.round(bSum / pixelCount);

        // Validation - ensure the point is bright enough
        if (rRef < 80 || gRef < 80 || bRef < 80) {
          return reject(new Error('Seçilen nokta çok koyu. Lütfen beyaz veya açık gri bir alan seçin.'));
        }

        // Calculate multipliers
        const cRed = 255 / rRef;
        const cGreen = 255 / gRef;
        const cBlue = 255 / bRef;

        // Apply transformation to whole image
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, Math.round(data[i] * cRed));
          data[i + 1] = Math.min(255, Math.round(data[i + 1] * cGreen));
          data[i + 2] = Math.min(255, Math.round(data[i + 2] * cBlue));
        }

        ctx.putImageData(imgData, 0, 0);

        const resultDataUrl = canvas.toDataURL('image/png');
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('Canvas to Blob failed'));
          resolve({
            blob,
            dataUrl: resultDataUrl,
            rgb: { r: rRef, g: gRef, b: bRef }
          });
        }, 'image/png');

      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Resim yüklenemedi'));
    img.src = imageDataUrl;
  });
};
