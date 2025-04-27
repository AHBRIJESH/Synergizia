
import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { verifyUPIPayment } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader } from "lucide-react";
import TransactionImageUpload from "./TransactionImageUpload";

interface UPIPaymentProps {
  amount: number;
  registrationId: string;
  email: string;
  onPaymentComplete: (success: boolean, transactionId?: string, transactionImage?: string) => void;
}

const UPI_ID = "ahbrijesh2004@okhdfcbank";

const UPIPayment: React.FC<UPIPaymentProps> = ({
  amount,
  registrationId,
  email,
  onPaymentComplete,
}) => {
  const [transactionId, setTransactionId] = React.useState("");
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [transactionImage, setTransactionImage] = React.useState("");
  const navigate = useNavigate();

  const upiPaymentLink = `upi://pay?pa=${UPI_ID}&pn=SYNERGIZIA25&am=${amount}&cu=INR&tn=Event_Registration`;

  const handleVerification = async () => {
    if (!transactionId) {
      toast.error("Please enter the transaction ID");
      return;
    }

    if (!transactionImage) {
      toast.error("Please upload the transaction screenshot");
      return;
    }

    setIsVerifying(true);

    try {
      const { data, error } = await verifyUPIPayment(
        transactionId,
        registrationId,
        email,
        transactionImage
      );

      if (error) {
        throw error;
      }

      toast.success("Payment verification initiated", {
        description: "Your payment is being verified. Please wait for confirmation.",
      });

      navigate("/registration-status", { 
        state: { 
          registrationId,
          email,
          message: "Your payment is being verified. You will receive a confirmation email shortly." 
        } 
      });

      onPaymentComplete(true, transactionId, transactionImage);
    } catch (error) {
      console.error("Payment verification failed:", error);
      toast.error("Payment verification failed", {
        description: "Please ensure you've entered the correct transaction ID",
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
        <CardDescription>Pay ₹{amount} using any UPI app</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <QRCodeSVG value={upiPaymentLink} size={200} />
          <p className="text-sm text-gray-500">
            Scan QR code or click button below to pay
          </p>
          <Button
            onClick={() => (window.location.href = upiPaymentLink)}
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

          <TransactionImageUpload 
            registrationId={registrationId}
            onImageUploaded={setTransactionImage}
          />

          <Button
            onClick={handleVerification}
            disabled={!transactionId || !transactionImage || isVerifying}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Verifying Payment
              </>
            ) : (
              "Verify Payment"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UPIPayment;
