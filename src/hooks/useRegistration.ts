
import { useState } from 'react';
import { toast } from "@/components/ui/sonner";
import { useRegistrationForm, FormData, RegistrationData, initialForm } from './useRegistrationForm';
import { useRegistrationValidation } from './useRegistrationValidation';
import { saveRegistration, getRegistrations } from './useRegistrationStorage';

export const useRegistration = () => {
  const { formData, handleChange, handleSelectChange, setFormData } = useRegistrationForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
  const [step, setStep] = useState<"details" | "payment">("details");
  const [currentRegistrationId, setCurrentRegistrationId] = useState<string>("");

  const { 
    validateEmailFormat, 
    validatePhoneFormat, 
    checkIfEmailExists,
    validateForm
  } = useRegistrationValidation();

  const calculateTotalAmount = (data: FormData = formData): number => {
    let total = data.selectedEvents.length > 0 ? 100 : 0;
    if (data.lunchOption === "veg") {
      total += 50;
    } else if (data.lunchOption === "nonveg") {
      total += 60;
    }
    return total;
  };

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm(formData);
    if (validationError) {
      setRegistrationError(validationError);
      toast.error("Validation Error", {
        description: validationError,
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
    setIsSubmitting,
    initialForm
  };
};

// Export RegistrationData for use in other components
export type { RegistrationData, FormData };
