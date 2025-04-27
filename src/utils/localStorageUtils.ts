
const LOCAL_STORAGE_KEY_PREFIX = 'synergizia_transaction_image_';

export const saveImageToLocalStorage = async (registrationId: string, imageData: string, fileName: string) => {
  try {
    // Convert base64 to blob
    const response = await fetch(imageData);
    const blob = await response.blob();

    // Create a File object
    const file = new File([blob], fileName, { type: blob.type });

    // Save to public/screenshot folder
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Use the File System Access API to save to public/screenshot
      const dirHandle = await window.showDirectoryPicker({
        startIn: 'downloads',
      });
      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      // Also save to localStorage as fallback
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${registrationId}`, imageData);
      return true;
    } catch (error) {
      console.error('Error saving to filesystem:', error);
      // Fallback to just localStorage
      localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${registrationId}`, imageData);
      return true;
    }
  } catch (error) {
    console.error('Error saving image:', error);
    return false;
  }
};

export const getImageFromLocalStorage = (registrationId: string): string | null => {
  try {
    return localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${registrationId}`);
  } catch (error) {
    console.error('Error getting image from localStorage:', error);
    return null;
  }
};

