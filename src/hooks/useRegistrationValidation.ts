
import { useState } from "react";
import { FormData } from './useRegistrationForm';
import { getRegistrations } from './useRegistrationStorage';

export const useRegistrationValidation = () => {
  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneFormat = (phone: string): boolean => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
  };

  const checkIfEmailExists = async (email: string): Promise<boolean> => {
    const registrations = await getRegistrations();
    return registrations.some((registration) => registration.email.toLowerCase() === email.toLowerCase());
  };

  const validateForm = async (data: FormData): Promise<string | null> => {
    if (!data.fullName || data.fullName.trim() === "") {
      return "Full name is required.";
    }

    if (!data.college || data.college.trim() === "") {
      return "College name is required.";
    }

    if (!data.department) {
      return "Department is required.";
    }

    if (data.department === "other" && (!data.customDepartment || data.customDepartment.trim() === "")) {
      return "Please specify your department.";
    }

    if (!data.year) {
      return "Year of study is required.";
    }

    if (!data.email || data.email.trim() === "") {
      return "Email is required.";
    }

    if (!validateEmailFormat(data.email)) {
      return "Please enter a valid email address.";
    }

    // Check for duplicate email
    const emailExists = await checkIfEmailExists(data.email);
    if (emailExists) {
      return "This email is already registered. Please use a different email.";
    }

    if (!data.phone || data.phone.trim() === "") {
      return "Phone number is required.";
    }

    if (!validatePhoneFormat(data.phone)) {
      return "Please enter a valid phone number (10-15 digits).";
    }

    if (!data.selectedEvents || data.selectedEvents.length === 0) {
      return "Please select at least one event.";
    }

    return null;
  };

  return {
    validateEmailFormat,
    validatePhoneFormat,
    checkIfEmailExists,
    validateForm,
  };
};
