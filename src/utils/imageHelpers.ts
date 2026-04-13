export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
export const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export const validateFile = (file: File): string | null => {
  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return 'Desteklenmeyen dosya formatı. Lütfen JPG, PNG veya WEBP yükleyin.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'Dosya 20 MB\'ı aşıyor. Lütfen daha küçük bir dosya seçin.';
  }
  return null;
};

export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      reject(new Error('Dosya okunamadı.'));
    };
    reader.readAsDataURL(file);
  });
};

export const downloadImage = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download failed', error);
  }
};
