
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { callEdgeFunction } from "@/lib/supabase";
import { toast } from "@/components/ui/sonner";
import { Loader } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  amount: number;
  name: string;
  email: string;
  phone: string;
  registrationId: string;
  onSuccess: (paymentId: string) => void;
  onFailure: () => void;
  isProcessing: boolean;
  setIsProcessing: (value: boolean) => void;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  amount,
  name,
  email,
  phone,
  registrationId,
  onSuccess,
  onFailure,
  isProcessing,
  setIsProcessing,
}) => {
  useEffect(() => {
    // Load Razorpay script when component mounts
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      // Request a payment order from our edge function
      const { data, error } = await callEdgeFunction("create-payment", {
        amount,
        name,
        email,
        registrationId,
      });

      if (error || !data) {
        toast.error("Payment initialization failed", {
          description: error?.message || "Please try again later.",
        });
        setIsProcessing(false);
        onFailure();
        return;
      }

      // Initialize Razorpay payment
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "SYNERGIZIA25",
        description: "Registration Payment",
        order_id: data.id,
        prefill: {
          name,
          email,
          contact: phone,
        },
        handler: function (response: any) {
          // On successful payment
          if (response.razorpay_payment_id) {
            toast.success("Payment successful!", {
              description: "Your registration is being processed.",
            });
            onSuccess(response.razorpay_payment_id);
          } else {
            toast.error("Payment failed", {
              description: "Please try again.",
            });
            onFailure();
          }
        },
        modal: {
          ondismiss: function() {
            toast.error("Payment cancelled", {
              description: "You cancelled the payment process.",
            });
            setIsProcessing(false);
            onFailure();
          },
        },
        notes: {
          registrationId: registrationId,
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error("Payment system error", {
        description: err instanceof Error ? err.message : "Please try again later.",
      });
      setIsProcessing(false);
      onFailure();
    }
  };

  return (
    <Button
      type="button" 
      onClick={handlePayment}
      disabled={isProcessing}
      className="w-full bg-synergizia-purple hover:bg-synergizia-purple-dark"
    >
      {isProcessing ? (
        <span className="flex items-center">
          <Loader className="animate-spin mr-2" size={16} /> Processing...
        </span>
      ) : (
        "Pay with Razorpay"
      )}
    </Button>
  );
};

export default RazorpayPayment;
