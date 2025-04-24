
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { verifyUPIPayment } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";

interface UPIPaymentProps {
  amount: number;
  registrationId: string;
  email: string; // Add email to the props
  onPaymentComplete: (success: boolean) => void;
}

const UPI_ID = "your.upi.id@bank"; // Replace with your actual UPI ID

const UPIPayment: React.FC<UPIPaymentProps> = ({ amount, registrationId, email, onPaymentComplete }) => {
  const [transactionId, setTransactionId] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);

  const upiPaymentLink = `upi://pay?pa=${UPI_ID}&pn=SYNERGIZIA25&am=${amount}&cu=INR&tn=Event_Registration`;

  const handleVerification = async () => {
    if (!transactionId) {
      toast.error("Please enter the transaction ID");
      return;
    }

    setIsVerifying(true);

    try {
      // Pass the email along with the transaction ID and registration ID
      const { data, error } = await verifyUPIPayment(transactionId, registrationId, email);

      if (error) {
        throw error;
      }

      toast.success("Payment recorded successfully!", {
        description: `Your payment is being verified. A confirmation will be sent to ${email} shortly.`
      });

      onPaymentComplete(true);
    } catch (error) {
      console.error('Payment verification failed:', error);
      toast.error("Payment verification failed", {
        description: "Please ensure you've entered the correct transaction ID"
      });
      onPaymentComplete(false);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>UPI Payment</CardTitle>
        <CardDescription>
          Pay ₹{amount} using any UPI app
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <QRCodeSVG value={upiPaymentLink} size={200} />
          <p className="text-sm text-gray-500">Scan QR code or click button below to pay</p>
          <Button
            onClick={() => window.location.href = upiPaymentLink}
            className="w-full"
          >
            Pay with UPI App
          </Button>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label htmlFor="transactionId">UPI Transaction ID</Label>
            <Input
              id="transactionId"
              placeholder="Enter UPI transaction ID after payment"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
          </div>

          <Button
            onClick={handleVerification}
            disabled={!transactionId || isVerifying}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Verifying Payment
              </>
            ) : (
              'Verify Payment'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UPIPayment;
