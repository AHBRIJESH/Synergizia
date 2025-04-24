
import React from 'react';
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import UPIPayment from "@/components/UPIPayment";
import { useRegistration } from "@/hooks/useRegistration";
import EventsSelection from './form/EventsSelection';
import RegistrationSummary from './form/RegistrationSummary';

const timeSlots: Record<string, string[]> = {
  "9:30 – 10:30 AM": ["Paper Presentation", "JAM"],
  "11:00 – 12:00 PM": ["Tech Quiz", "Snap Expo"],
  "12:00 – 1:00 PM": ["Freq Code", "Crossing Bridge"],
  "2:00 – 3:00 PM": ["Find n Build", "Luck in Sack"],
};

const RegistrationForm = () => {
  const {
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
    setStep
  } = useRegistration();

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

  const handleEventChange = (eventTitle: string, checked: boolean) => {
    if (checked) {
      handleSelectChange('selectedEvents', [...formData.selectedEvents, eventTitle]);
    } else {
      handleSelectChange('selectedEvents', 
        formData.selectedEvents.filter(event => event !== eventTitle)
      );
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
                onValueChange={(value) => handleSelectChange("department", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="computer_science">Computer Science</SelectItem>
                    <SelectItem value="information_technology">Information Technology</SelectItem>
                    <SelectItem value="electronics">Electronics & Communication</SelectItem>
                    <SelectItem value="electrical">Electrical Engineering</SelectItem>
                    <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                    <SelectItem value="civil">Civil Engineering</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {formData.department === "other" && (
              <div className="space-y-2">
                <Label htmlFor="customDepartment">Specify Department *</Label>
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
                onValueChange={(value) => handleSelectChange("year", value)}
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

            <EventsSelection
              selectedEvents={formData.selectedEvents}
              onEventChange={handleEventChange}
              timeSlots={timeSlots}
              isEventDisabled={isEventDisabled}
            />
            
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
      <div className="space-y-6">
        <RegistrationSummary
          email={formData.email}
          selectedEvents={formData.selectedEvents}
          lunchOption={formData.lunchOption}
          calculateTotalAmount={calculateTotalAmount}
        />

        <UPIPayment
          amount={calculateTotalAmount()}
          registrationId={currentRegistrationId}
          email={formData.email}
          onPaymentComplete={(success) => {
            if (success) {
              setRegistrationSuccess(true);
              setTimeout(() => {
                setFormData(initialForm);
                setRegistrationSuccess(false);
                setStep("details");
              }, 3000);
            }
          }}
        />

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("details")}
            className="flex-1"
          >
            Back to Details
          </Button>
        </div>
      </div>
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
          Secure your spot at SYNERGIZIA25 by filling out the registration form below. 
          Please note that you cannot register for events happening at the same time.
        </p>

        <Card className="max-w-2xl mx-auto bg-white">
          <CardHeader>
            <CardTitle>Event Registration</CardTitle>
            <CardDescription>Fill in your details to register for the symposium</CardDescription>
            
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
                  Registration successful! Your payment has been verified and your spot is confirmed.
                  You will receive a confirmation email shortly.
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
