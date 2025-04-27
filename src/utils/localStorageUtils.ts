
const LOCAL_STORAGE_KEY_PREFIX = 'synergizia_transaction_image_';

export const saveImageToLocalStorage = async (registrationId: string, imageData: string, fileName: string) => {
  try {
    // Convert base64 to blob
    const response = await fetch(imageData);
    const blob = await response.blob();

    // Create a File object
    const file = new File([blob], fileName, { type: blob.type });

    try {
      // Check if File System Access API is available
      if ('showDirectoryPicker' in window) {
        // This is a type assertion to tell TypeScript that we know this method exists
        const directoryPicker = (window as any).showDirectoryPicker;
        try {
          const dirHandle = await directoryPicker({
            startIn: 'downloads',
          });
          const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(blob);
          await writable.close();
          console.log("File saved to filesystem successfully");
        } catch (fsError) {
          console.error('User cancelled directory selection or access denied:', fsError);
          // Fall back to localStorage if user cancels or permission is denied
          localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${registrationId}`, imageData);
        }
      } else {
        console.log("File System Access API not available, using localStorage only");
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${registrationId}`, imageData);
      }
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
