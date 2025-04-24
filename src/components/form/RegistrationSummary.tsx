
import React from 'react';

interface RegistrationSummaryProps {
  email: string;
  selectedEvents: string[]; // This is already an array
  lunchOption: string;
  calculateTotalAmount: () => number;
}

const RegistrationSummary: React.FC<RegistrationSummaryProps> = ({
  email,
  selectedEvents,
  lunchOption,
  calculateTotalAmount
}) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-2">Registration Summary</h3>
      <div className="flex justify-between mb-2">
        <span>Events ({selectedEvents.length})</span>
        <span>₹100</span>
      </div>
      {lunchOption && (
        <div className="flex justify-between mb-2">
          <span>Lunch ({lunchOption === "veg" ? "Vegetarian" : "Non-Vegetarian"})</span>
          <span>₹{lunchOption === "veg" ? 50 : 60}</span>
        </div>
      )}
      <div className="flex justify-between font-bold pt-2 border-t border-gray-300 mt-2">
        <span>Total</span>
        <span>₹{calculateTotalAmount()}</span>
      </div>
      
      <div className="mt-4 pt-2 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Confirmation will be sent to: <span className="font-medium">{email}</span>
        </p>
      </div>
    </div>
  );
};

export default RegistrationSummary;
