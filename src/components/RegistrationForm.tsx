import React, { useState } from "react";
import { toast } from "@/components/ui/sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Event } from "./EventCard";
import { AlertCircle, CheckCircle, Loader, CreditCard, IndianRupee } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import RazorpayPayment from "./RazorpayPayment";

interface TimeSlot {
  time: string;
  events: Event[];
}

const events: Event[] = [
  {
    id: "TECH01",
    title: "Freq Code",
    type: "technical",
    timeSlot: "12:00 – 1:00 PM",
    description:
      "A coding competition designed to test your programming skills and algorithmic thinking under time pressure.",
    icon: null,
  },
  {
    id: "TECH02",
    title: "Tech Quiz",
    type: "technical",
    timeSlot: "11:00 – 12:00 PM",
    description:
      "Test your knowledge across various domains of technology in this fast-paced quiz competition.",
    icon: null,
  },
  {
    id: "TECH03",
    title: "Find n Build",
    type: "technical",
    timeSlot: "2:00 – 3:00 PM",
    description:
      "Scavenge for components and build a working prototype in this exciting engineering challenge.",
    icon: null,
  },
  {
    id: "TECH04",
    title: "Paper Presentation",
    type: "technical",
    timeSlot: "9:30 – 10:30 AM",
    description:
      "Present your research papers and innovative ideas to a panel of expert judges and audience.",
    icon: null,
  },
  {
    id: "NTECH01",
    title: "JAM",
    type: "non-technical",
    timeSlot: "9:30 – 10:30 AM",
    description:
      "Just A Minute - Showcase your spontaneity and speaking skills in this classic event.",
    icon: null,
  },
  {
    id: "NTECH02",
    title: "Snap Expo",
    type: "non-technical",
    timeSlot: "11:00 – 12:00 PM",
    description:
      "A photography competition that challenges your creative eye and storytelling abilities.",
    icon: null,
  },
  {
    id: "NTECH03",
    title: "Crossing Bridge",
    type: "non-technical",
    timeSlot: "12:00 – 1:00 PM",
    description:
      "A team-based problem-solving event that tests your coordination and strategic thinking.",
    icon: null,
  },
  {
    id: "NTECH04",
    title: "Luck in Sack",
    type: "non-technical",
    timeSlot: "2:00 – 3:00 PM",
    description:
      "A fun-filled event that combines luck with quick thinking and adaptability.",
    icon: null,
  },
];

const timeSlots: Record<string, string[]> = {
  "9:30 – 10:30 AM": ["Paper Presentation", "JAM"],
  "11:00 – 12:00 PM": ["Tech Quiz", "Snap Expo"],
  "12:00 – 1:00 PM": ["Freq Code", "Crossing Bridge"],
  "2:00 – 3:00 PM": ["Find n Build", "Luck in Sack"],
};

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
  paymentMethod: string;
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
  paymentMethod: "",
};

export const LOCAL_STORAGE_KEY = "synergizia_registrations";

const RegistrationForm = () => {
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(
    null
  );
  const [registrationSuccess, setRegistrationSuccess] =
    useState<boolean>(false);
  const [step, setStep] = useState<"details" | "payment">("details");
  const [transactionId, setTransactionId] = useState<string>("");
  const [currentRegistrationId, setCurrentRegistrationId] = useState<string>("");

  const getRegistrations = (): RegistrationData[] => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  };

  const saveRegistration = (registration: RegistrationData) => {
    const registrations = getRegistrations();
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([...registrations, registration])
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setRegistrationError(null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setRegistrationError(null);
  };

  const handleEventChange = (eventTitle: string, checked: boolean) => {
    let eventTimeSlot = "";
    for (const [time, eventNames] of Object.entries(timeSlots)) {
      if (eventNames.includes(eventTitle)) {
        eventTimeSlot = time;
        break;
      }
    }

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        selectedEvents: [...prev.selectedEvents, eventTitle],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        selectedEvents: prev.selectedEvents.filter(
          (event) => event !== eventTitle
        ),
      }));
    }

    setRegistrationError(null);
  };

  const isEventDisabled = (eventTitle: string): boolean => {
    if (formData.selectedEvents.length === 0) return false;

    let eventTimeSlot = "";
    for (const [time, eventNames] of Object.entries(timeSlots)) {
      if (eventNames.includes(eventTitle)) {
        eventTimeSlot = time;
        break;
      }
    }

    for (const selectedEvent of formData.selectedEvents) {
      if (selectedEvent === eventTitle) return false;

      for (const [time, eventNames] of Object.entries(timeSlots)) {
        if (time === eventTimeSlot && eventNames.includes(selectedEvent)) {
          return true;
        }
      }
    }

    return false;
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

  const calculateTotalAmount = (): number => {
    let total = formData.selectedEvents.length > 0 ? 100 : 0;

    if (formData.lunchOption === "veg") {
      total += 50;
    } else if (formData.lunchOption === "nonveg") {
      total += 60;
    }

    return total;
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

  const handleRazorpaySuccess = (paymentId: string) => {
    setTransactionId(paymentId);
    completeRegistration(paymentId);
  };

  const handleRazorpayFailure = () => {
    setIsSubmitting(false);
  };

  const completeRegistration = (paymentId: string) => {
    try {
      const registration: RegistrationData = {
        ...formData,
        id: currentRegistrationId,
        registrationDate: new Date().toISOString(),
        paymentDetails: {
          amount: calculateTotalAmount(),
          lunchOption: formData.lunchOption,
          paymentMethod: "razorpay",
          paymentStatus: "Pending",
          transactionId: paymentId
        }
      };

      saveRegistration(registration);

      setRegistrationSuccess(true);

      toast.success("Registration Submitted!", {
        description: "Your registration has been submitted. You will receive a confirmation email shortly.",
      });

      setTimeout(() => {
        setFormData(initialForm);
        setRegistrationSuccess(false);
        setStep("details");
        setTransactionId("");
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

  const handleManualPayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.paymentMethod) {
      setRegistrationError("Please select a payment method.");
      toast.error("Payment Error", {
        description: "Please select a payment method.",
      });
      return;
    }

    if (formData.paymentMethod === "upi" && !transactionId) {
      setRegistrationError("Please enter your UPI transaction ID for verification.");
      toast.error("Payment Error", {
        description: "Please enter your UPI transaction ID for verification.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const registration: RegistrationData = {
        ...formData,
        id: currentRegistrationId || `REG-${Date.now()}`,
        registrationDate: new Date().toISOString(),
        paymentDetails: {
          amount: calculateTotalAmount(),
          lunchOption: formData.lunchOption,
          paymentMethod: formData.paymentMethod,
          paymentStatus: "Pending",
          transactionId: formData.paymentMethod === "upi" ? transactionId : undefined
        }
      };

      saveRegistration(registration);

      setRegistrationSuccess(true);

      toast.success("Registration Submitted!", {
        description: "Your registration has been submitted and is awaiting payment verification.",
      });

      setTimeout(() => {
        setFormData(initialForm);
        setRegistrationSuccess(false);
        setStep("details");
        setTransactionId("");
      }, 3000);
    } catch (error) {
      setRegistrationError(
        "There was an error with your registration. Please try again."
      );
      toast.error("Registration Failed", {
        description:
          "There was an error with your registration. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPersonalDetailsForm = () => {
    return (
      <form onSubmit={handleProceedToPayment} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="college">College Name *</Label>
              <Input
                id="college"
                name="college"
                value={formData.college}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Department *</Label>
              <Select
                value={formData.department}
                onValueChange={(value) =>
                  handleSelectChange("department", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="computer_science">
                      Computer Science
                    </SelectItem>
                    <SelectItem value="information_technology">
                      Information Technology
                    </SelectItem>
                    <SelectItem value="electronics">
                      Electronics & Communication
                    </SelectItem>
                    <SelectItem value="electrical">
                      Electrical Engineering
                    </SelectItem>
                    <SelectItem value="mechanical">
                      Mechanical Engineering
                    </SelectItem>
                    <SelectItem value="civil">
                      Civil Engineering
                    </SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {formData.department === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customDepartment">
                  Specify Department *
                </Label>
                <Input
                  id="customDepartment"
                  name="customDepartment"
                  value={formData.customDepartment}
                  onChange={handleChange}
                  required
                  placeholder="Enter your department"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="year">Year of Study *</Label>
              <Select
                value={formData.year}
                onValueChange={(value) =>
                  handleSelectChange("year", value)
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="1">First Year</SelectItem>
                    <SelectItem value="2">Second Year</SelectItem>
                    <SelectItem value="3">Third Year</SelectItem>
                    <SelectItem value="4">Fourth Year</SelectItem>
                    <SelectItem value="pg">Postgraduate</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="Enter 10-15 digit number"
              />
            </div>

            <div className="space-y-3">
              <Label>Select Events *</Label>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(timeSlots).map(([time, eventNames]) => (
                  <div key={time} className="space-y-2">
                    <div className="text-sm font-medium text-gray-500">
                      {time}
                    </div>
                    <div className="flex flex-col gap-2 pl-4 border-l-2 border-gray-200">
                      {eventNames.map((name) => {
                        const isSelected =
                          formData.selectedEvents.includes(name);
                        const isDisabled =
                          !isSelected && isEventDisabled(name);

                        return (
                          <div
                            key={name}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`event-${name}`}
                              checked={isSelected}
                              onCheckedChange={(checked) => {
                                handleEventChange(name, checked === true);
                              }}
                              disabled={isDisabled}
                            />
                            <Label
                              htmlFor={`event-${name}`}
                              className={
                                isDisabled ? "text-gray-400" : ""
                              }
                            >
                              {name}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {formData.selectedEvents.length === 0 && (
                <p className="text-sm text-red-500">
                  Please select at least one event.
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <Label>Lunch Option</Label>
              <RadioGroup 
                value={formData.lunchOption}
                onValueChange={(value) => handleSelectChange("lunchOption", value)}
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="veg" id="lunch-veg" />
                  <Label htmlFor="lunch-veg">Vegetarian (₹50)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="nonveg" id="lunch-nonveg" />
                  <Label htmlFor="lunch-nonveg">Non-Vegetarian (₹60)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="" id="lunch-none" />
                  <Label htmlFor="lunch-none">No lunch required</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-lg font-semibold">Registration Summary</p>
              <p className="text-sm text-gray-500">Events and lunch selection</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold">Total: ₹{calculateTotalAmount()}</p>
              <p className="text-sm text-gray-500">
                Events: ₹{formData.selectedEvents.length > 0 ? 100 : 0} | 
                Lunch: ₹{formData.lunchOption === "veg" ? 50 : (formData.lunchOption === "nonveg" ? 60 : 0)}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-synergizia-purple hover:bg-synergizia-purple-dark"
            disabled={isSubmitting || formData.selectedEvents.length === 0}
          >
            Proceed to Payment
          </Button>
        </div>
      </form>
    );
  };

  const renderPaymentForm = () => {
    return (
      <form onSubmit={handleManualPayment} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold mb-2">Registration Summary</h3>
          <div className="flex justify-between mb-2">
            <span>Events ({formData.selectedEvents.length})</span>
            <span>₹100</span>
          </div>
          {formData.lunchOption && (
            <div className="flex justify-between mb-2">
              <span>Lunch ({formData.lunchOption === "veg" ? "Vegetarian" : "Non-Vegetarian"})</span>
              <span>₹{formData.lunchOption === "veg" ? 50 : 60}</span>
            </div>
          )}
          <div className="flex justify-between font-bold pt-2 border-t border-gray-300 mt-2">
            <span>Total</span>
            <span>₹{calculateTotalAmount()}</span>
          </div>
        </div>

        <Alert className="mb-6 bg-blue-50 border-blue-200 text-blue-700">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            Your registration will be confirmed after your payment has been verified. This process may take up to 24 hours.
          </AlertDescription>
        </Alert>

        <div className="space-y-6">
          <div>
            <Label className="text-lg font-semibold">Select Payment Method</Label>
            <RadioGroup 
              value={formData.paymentMethod}
              onValueChange={(value) => handleSelectChange("paymentMethod", value)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3"
            >
              <div className={`border rounded-lg p-4 cursor-pointer ${formData.paymentMethod === "razorpay" ? "border-synergizia-purple bg-purple-50" : "border-gray-200"}`}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="razorpay" id="payment-razorpay" />
                  <Label htmlFor="payment-razorpay" className="cursor-pointer flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" /> Razorpay (Instant)
                  </Label>
                </div>
                {formData.paymentMethod === "razorpay" && (
                  <div className="mt-3 pl-6">
                    <p className="text-sm text-gray-600 mb-3">Pay securely with credit/debit cards, UPI, net banking and more</p>
                    <RazorpayPayment 
                      amount={calculateTotalAmount()}
                      name={formData.fullName}
                      email={formData.email}
                      phone={formData.phone}
                      registrationId={currentRegistrationId}
                      onSuccess={handleRazorpaySuccess}
                      onFailure={handleRazorpayFailure}
                      isProcessing={isSubmitting}
                      setIsProcessing={setIsSubmitting}
                    />
                  </div>
                )}
              </div>
              
              <div className={`border rounded-lg p-4 cursor-pointer ${formData.paymentMethod === "upi" ? "border-synergizia-purple bg-purple-50" : "border-gray-200"}`}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="payment-upi" />
                  <Label htmlFor="payment-upi" className="cursor-pointer flex items-center">
                    <IndianRupee className="w-5 h-5 mr-2" /> UPI/Bank Transfer (Manual)
                  </Label>
                </div>
                {formData.paymentMethod === "upi" && (
                  <div className="mt-3 pl-6">
                    <div className="bg-white p-3 rounded border text-sm">
                      <p className="font-semibold mb-2">Bank Account Details:</p>
                      <p><span className="font-medium">Account Holder:</span> K.Karthika</p>
                      <p><span className="font-medium">Account Number:</span> 20144174214</p>
                      <p><span className="font-medium">IFSC Code:</span> SBIN0003925</p>
                      <p><span className="font-medium">Bank Name:</span> State Bank of India</p>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Label htmlFor="transactionId">UPI/Bank Transaction ID *</Label>
                      <Input 
                        id="transactionId"
                        placeholder="Enter your transaction ID" 
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        required={formData.paymentMethod === "upi"}
                      />
                      <p className="text-xs text-gray-500">Please provide the transaction ID for payment verification</p>
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full mt-3 bg-synergizia-purple hover:bg-synergizia-purple-dark"
                      disabled={isSubmitting || !transactionId}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <Loader className="animate-spin mr-2" size={16} />{" "}
                          Processing...
                        </span>
                      ) : (
                        `Submit Registration`
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("details")}
            className="flex-1"
            disabled={isSubmitting}
          >
            Back to Details
          </Button>
        </div>
      </form>
    );
  };

  return (
    <section id="register" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center">
          Register <span className="text-synergizia-purple">Now</span>
        </h2>
        <div className="w-20 h-1 bg-synergizia-gold mx-auto mb-6"></div>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          Secure your spot at SYNERGIZIA25 by filling out the registration form
          below. Please note that you cannot register for events happening at
          the same time.
        </p>

        <Card className="max-w-2xl mx-auto bg-white">
          <CardHeader>
            <CardTitle>Event Registration</CardTitle>
            <CardDescription>
              Fill in your details to register for the symposium
            </CardDescription>
            
            <div className="flex items-center mt-4">
              <div className={`flex-1 pb-2 border-b-2 ${step === "details" ? "border-synergizia-purple text-synergizia-purple font-medium" : "border-gray-200 text-gray-400"}`}>
                1. Personal Details
              </div>
              <div className={`flex-1 pb-2 border-b-2 ${step === "payment" ? "border-synergizia-purple text-synergizia-purple font-medium" : "border-gray-200 text-gray-400"}`}>
                2. Payment
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {registrationError && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{registrationError}</AlertDescription>
              </Alert>
            )}

            {registrationSuccess && (
              <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription>
                  Registration submitted successfully! Your registration is pending payment verification.
                  Our team will review your payment and confirm your registration shortly.
                </AlertDescription>
              </Alert>
            )}

            {step === "details" ? renderPersonalDetailsForm() : renderPaymentForm()}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default RegistrationForm;
