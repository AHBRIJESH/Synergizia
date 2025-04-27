
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface TransactionImageUploadProps {
  registrationId: string;
  onImageUploaded: (imageUrl: string) => void;
}

const TransactionImageUpload: React.FC<TransactionImageUploadProps> = ({
  registrationId,
  onImageUploaded,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];

      if (!file) {
        toast.error("Please select a file to upload");
        return;
      }

      // Check if Supabase is configured with valid credentials
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // If Supabase is not configured, use local storage as fallback
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log(
          "Using local file preview as Supabase storage is not configured"
        );

        // Create a local preview URL using base64 encoding to ensure persistence
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          setPreviewUrl(base64String);
          onImageUploaded(base64String);
          toast.success("Transaction image processed");
        };
        reader.readAsDataURL(file);
        setUploading(false);
        return;
      }

      // If Supabase is configured, proceed with upload
      const fileExt = file.name.split(".").pop();
      const filePath = `${registrationId}/transaction.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // If upload fails, fallback to local preview
        console.error("Error uploading to Supabase:", uploadError);
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          setPreviewUrl(base64String);
          onImageUploaded(base64String);
          toast.success("Transaction image processed locally (fallback mode)");
        };
        reader.readAsDataURL(file);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("payment-proofs").getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onImageUploaded(publicUrl);
      toast.success("Transaction image uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload transaction image");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Label htmlFor="transaction-image" className="block">
        Upload Payment Screenshot *
      </Label>
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <label className="flex flex-col items-center cursor-pointer">
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">
            {uploading
              ? "Uploading..."
              : "Click to upload transaction screenshot"}
          </span>
          <input
            id="transaction-image"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>

        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <img
              src={previewUrl}
              alt="Transaction preview"
              className="max-h-32 rounded border border-gray-200"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionImageUpload;
