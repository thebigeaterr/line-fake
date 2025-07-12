// 画像圧縮ユーティリティ
export const compressImage = (file: File, maxWidth = 1024, quality = 0.8): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // アスペクト比を保持しながらリサイズ
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const newWidth = img.width * ratio;
      const newHeight = img.height * ratio;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // 画像を描画
      ctx?.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Blobに変換
      canvas.toBlob((blob) => {
        if (blob) {
          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now(),
          });
          resolve(compressedFile);
        } else {
          reject(new Error('画像の圧縮に失敗しました'));
        }
      }, 'image/jpeg', quality);
    };
    
    img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
    img.src = URL.createObjectURL(file);
  });
};

// ファイルサイズをチェックして必要に応じて圧縮
export const processImageFile = async (file: File, maxSizeMB = 5): Promise<File> => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  // ファイルサイズが制限以下なら圧縮しない
  if (file.size <= maxSizeBytes) {
    return file;
  }
  
  // 段階的に品質を下げて圧縮
  let quality = 0.9;
  let compressedFile = file;
  
  while (compressedFile.size > maxSizeBytes && quality > 0.1) {
    compressedFile = await compressImage(file, 1024, quality);
    quality -= 0.1;
  }
  
  // それでも大きい場合はより小さいサイズで再圧縮
  if (compressedFile.size > maxSizeBytes) {
    compressedFile = await compressImage(file, 800, 0.7);
  }
  
  return compressedFile;
};