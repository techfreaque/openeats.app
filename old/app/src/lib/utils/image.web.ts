// Web-specific implementation (no Jimp)
export const processImage = async (imageUri: string): Promise<string> => {
  // Just return the original URI on web
  return imageUri;
};

export const checkImageExists = async (imageUri: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = imageUri;
  });
};
