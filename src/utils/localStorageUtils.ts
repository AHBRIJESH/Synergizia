
const LOCAL_STORAGE_KEY_PREFIX = 'synergizia_transaction_image_';

export const saveImageToLocalStorage = (registrationId: string, imageData: string) => {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${registrationId}`, imageData);
    return true;
  } catch (error) {
    console.error('Error saving image to localStorage:', error);
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

