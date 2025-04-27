
import React, { useState } from 'react';
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface TransactionImageUploadProps {
  registrationId: string;
  onImageUploaded: (imageUrl: string) => void;
}

const TransactionImageUpload: React.FC<TransactionImageUploadProps> = ({ registrationId, onImageUploaded }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];
      
      if (!file) {
        toast.error("Please select a file to upload");
        return;
      }

      // Upload image to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${registrationId}/transaction.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('payment-proofs')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('payment-proofs')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      toast.success("Transaction image uploaded successfully");
    } catch (error) {
      console.error('Error uploading file:', error);
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
            {uploading ? "Uploading..." : "Click to upload transaction screenshot"}
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
      </div>
    </div>
  );
};

export default TransactionImageUpload;
