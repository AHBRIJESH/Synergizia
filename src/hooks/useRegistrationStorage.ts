
import { RegistrationData } from './useRegistrationForm';

// In-memory storage (this would be replaced with actual API calls in production)
const LOCAL_STORAGE_KEY = 'synergizia_registrations';

export const saveRegistration = (registration: RegistrationData): void => {
  try {
    const existingRegistrations = getRegistrations();
    const updatedRegistrations = [...existingRegistrations, registration];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedRegistrations));
  } catch (error) {
    console.error('Error saving registration:', error);
    throw new Error('Failed to save registration');
  }
};

export const getRegistrations = (): RegistrationData[] => {
  try {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Error retrieving registrations:', error);
    return [];
  }
};

export const getRegistrationById = (id: string): RegistrationData | undefined => {
  const registrations = getRegistrations();
  return registrations.find((reg) => reg.id === id);
};

export const updateRegistration = (updatedRegistration: RegistrationData): void => {
  try {
    const registrations = getRegistrations();
    const updatedRegistrations = registrations.map((reg) => 
      reg.id === updatedRegistration.id ? updatedRegistration : reg
    );
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedRegistrations));
  } catch (error) {
    console.error('Error updating registration:', error);
    throw new Error('Failed to update registration');
  }
};

export const deleteRegistration = (id: string): void => {
  try {
    const registrations = getRegistrations();
    const updatedRegistrations = registrations.filter((reg) => reg.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedRegistrations));
  } catch (error) {
    console.error('Error deleting registration:', error);
    throw new Error('Failed to delete registration');
  }
};
