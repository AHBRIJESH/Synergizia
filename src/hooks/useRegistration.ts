
import { useState } from 'react';
import { toast } from "@/components/ui/sonner";
import { useNavigate } from 'react-router-dom';
import { useRegistrationForm, FormData, RegistrationData, initialForm } from './useRegistrationForm';
import { useRegistrationValidation } from './useRegistrationValidation';
import { saveRegistration } from './useRegistrationStorage';
import { callEdgeFunction } from '@/lib/supabase';

export const useRegistration = () => {
  const navigate = useNavigate();
  const { formData, handleChange, handleSelectChange, setFormData } = useRegistrationForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
  const [currentRegistrationId, setCurrentRegistrationId] = useState<string>("");

  const { 
    validateEmailFormat, 
    validatePhoneFormat, 
    checkIfEmailExists,
    validateForm
  } = useRegistrationValidation();

  const calculateTotalAmount = (data: FormData = formData): number => {
    // Fixed total price of 150
    return 150;
  };

  const handleSubmitRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRegistrationError(null);

    try {
      const validationError = await validateForm(formData);
      if (validationError) {
        setRegistrationError(validationError);
        toast.error("Validation Error", {
          description: validationError,
        });
        setIsSubmitting(false);
        return;
      }

      const registrationId = `REG-${Date.now()}`;
      setCurrentRegistrationId(registrationId);
      
      // Create registration object
      const registration: RegistrationData = {
        ...formData,
        id: registrationId,
        registrationDate: new Date().toISOString(),
        paymentDetails: {
          amount: calculateTotalAmount(),
          lunchOption: formData.lunchOption,
          paymentMethod: "on-site",
          paymentStatus: "Pending",
        }
      };

      // Save registration locally
      saveRegistration(registration);
      
      // Call the send email function
      const { data, error } = await callEdgeFunction('verify-upi-payment', {
        email: formData.email,
        registrationId: registrationId,
        transactionId: 'pending-payment-on-site',
      });

      if (error) {
        console.error('Email sending failed:', error);
        toast.error("Email Error", {
          description: "Registration successful but we couldn't send an email confirmation. Please take a screenshot for your records.",
        });
      } else {
        console.log('Email sending response:', data);
      }

      // Set success state
      setRegistrationSuccess(true);
      toast.success("Registration Successful!", {
        description: `Your registration has been received. Please pay ₹${calculateTotalAmount()} at the venue.`,
      });

      // Redirect to confirmation page
      setTimeout(() => {
        navigate('/registration-status', {
          state: {
            registrationId: registrationId,
            email: formData.email,
            message: "Your registration has been received. A confirmation email has been sent to your email address. Please pay the registration fee of ₹150 at the venue."
          }
        });
        
        // Reset form after redirect
        setFormData(initialForm);
        setRegistrationSuccess(false);
        setIsSubmitting(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error during registration:", error);
      setRegistrationError("An unexpected error occurred. Please try again.");
      toast.error("Registration Error", {
        description: "An unexpected error occurred. Please try again.",
      });
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    isSubmitting,
    registrationError,
    registrationSuccess,
    currentRegistrationId,
    handleChange,
    handleSelectChange,
    calculateTotalAmount,
    handleSubmitRegistration,
    setIsSubmitting,
    initialForm
  };
};

// Export RegistrationData for use in other components
export type { RegistrationData, FormData };