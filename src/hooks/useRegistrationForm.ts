
import { useState } from 'react';

export interface FormData {
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

export const initialForm: FormData = {
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

export const useRegistrationForm = () => {
  const [formData, setFormData] = useState<FormData>(initialForm);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return {
    formData,
    handleChange,
    handleSelectChange,
    setFormData
  };
};
