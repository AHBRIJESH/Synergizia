
import { useState } from 'react';
import { toast } from "@/components/ui/sonner";
import { verifyUPIPayment } from "@/lib/supabase";

interface FormData {
  fullName: string;
  college: string;
  department: string;
  customDepartment: string;
  year: string;
  email: string;
  phone: string;
  selectedEvents: string[];
  lunchOption: string;
}

export interface RegistrationData extends FormData {
  id: string;
  registrationDate: string;
  paymentDetails: {
    amount: number;
    lunchOption: string;
    paymentMethod: string;
    paymentStatus: "Pending" | "Verified" | "Rejected";
    transactionId?: string;
  };
}

const initialForm: FormData = {
  fullName: "",
  college: "",
  department: "",
  customDepartment: "",
  year: "",
  email: "",
  phone: "",
  selectedEvents: [],
  lunchOption: "",
};

export const useRegistration = () => {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
  const [step, setStep] = useState<"details" | "payment">("details");
  const [currentRegistrationId, setCurrentRegistrationId] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setRegistrationError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setRegistrationError(null);
  };

  const calculateTotalAmount = (): number => {
    let total = formData.selectedEvents.length > 0 ? 100 : 0;
    if (formData.lunchOption === "veg") {
      total += 50;
    } else if (formData.lunchOption === "nonveg") {
      total += 60;
    }
    return total;
  };

  const getRegistrations = (): RegistrationData[] => {
    const data = localStorage.getItem('synergizia_registrations');
    return data ? JSON.parse(data) : [];
  };

  const saveRegistration = (registration: RegistrationData) => {
    const registrations = getRegistrations();
    localStorage.setItem(
      'synergizia_registrations',
      JSON.stringify([...registrations, registration])
    );
  };

  const validateEmailFormat = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneFormat = (phone: string): boolean => {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone);
  };

  const checkIfEmailExists = (email: string): boolean => {
    const registrations = getRegistrations();
    return registrations.some(
      (reg) => reg.email.toLowerCase() === email.toLowerCase()
    );
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.fullName ||
      !formData.college ||
      !formData.department ||
      !formData.year ||
      !formData.email ||
      !formData.phone ||
      formData.selectedEvents.length === 0 ||
      (formData.department === "other" && !formData.customDepartment)
    ) {
      setRegistrationError(
        "Please fill in all required fields and select at least one event."
      );
      toast.error("Validation Error", {
        description:
          "Please fill in all required fields and select at least one event.",
      });
      return;
    }

    if (!validateEmailFormat(formData.email)) {
      setRegistrationError("Please enter a valid email address.");
      toast.error("Validation Error", {
        description: "Please enter a valid email address.",
      });
      return;
    }

    if (!validatePhoneFormat(formData.phone)) {
      setRegistrationError(
        "Please enter a valid phone number (10-15 digits only)."
      );
      toast.error("Validation Error", {
        description: "Please enter a valid phone number (10-15 digits only).",
      });
      return;
    }

    if (checkIfEmailExists(formData.email)) {
      setRegistrationError(
        "This email is already registered. Please use a different email."
      );
      toast.error("Registration Error", {
        description:
          "This email is already registered. Please use a different email.",
      });
      return;
    }

    const registrationId = `REG-${Date.now()}`;
    setCurrentRegistrationId(registrationId);
    setRegistrationError(null);
    setStep("payment");
  };

  const completeRegistration = (transactionId: string) => {
    try {
      const registration: RegistrationData = {
        ...formData,
        id: currentRegistrationId,
        registrationDate: new Date().toISOString(),
        paymentDetails: {
          amount: calculateTotalAmount(),
          lunchOption: formData.lunchOption,
          paymentMethod: "upi",
          paymentStatus: "Verified",
          transactionId: transactionId
        }
      };

      saveRegistration(registration);
      setRegistrationSuccess(true);

      toast.success("Registration Successful!", {
        description: `Your payment has been verified and your registration is confirmed. A confirmation will be sent to ${formData.email}.`,
      });

      setTimeout(() => {
        setFormData(initialForm);
        setRegistrationSuccess(false);
        setStep("details");
        setIsSubmitting(false);
      }, 3000);
    } catch (error) {
      setRegistrationError(
        "There was an error with your registration. Please try again."
      );
      toast.error("Registration Failed", {
        description:
          "There was an error with your registration. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    registrationError,
    registrationSuccess,
    step,
    currentRegistrationId,
    handleChange,
    handleSelectChange,
    calculateTotalAmount,
    handleProceedToPayment,
    completeRegistration,
    setStep,
    setIsSubmitting
  };
};
