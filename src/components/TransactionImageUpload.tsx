import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveImageToLocalStorage, getImageFromLocalStorage } from "@/utils/localStorageUtils";

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

  useEffect(() => {
    // Check if there's a saved image in localStorage
    const savedImage = getImageFromLocalStorage(registrationId);
    if (savedImage) {
      setPreviewUrl(savedImage);
      onImageUploaded(savedImage);
    }
  }, [registrationId, onImageUploaded]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      const file = event.target.files?.[0];

      if (!file) {
        toast.error("Please select a file to upload");
        return;
      }

      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const saveToLocalStorage = (base64String: string) => {
        const saved = saveImageToLocalStorage(registrationId, base64String);
        if (saved) {
          setPreviewUrl(base64String);
          onImageUploaded(base64String);
          return true;
        }
        return false;
      };

      // If Supabase is not configured, use localStorage as fallback
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log("Supabase not configured, using localStorage as fallback");
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          if (saveToLocalStorage(base64String)) {
            toast.success("Image saved locally (demo mode)");
          } else {
            toast.error("Failed to save image locally");
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      console.log("Uploading to Supabase storage bucket: payment-proofs");
      
      // Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const filePath = `${registrationId}/transaction.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Error uploading to Supabase:", uploadError);
        
        // Fallback to localStorage if upload fails
        console.log("Upload failed, using localStorage as fallback");
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          if (saveToLocalStorage(base64String)) {
            toast.warning("Upload to cloud storage failed. Image saved locally.");
          } else {
            toast.error("Failed to save image locally");
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // Get the public URL of the uploaded file
      const {
        data: { publicUrl },
      } = supabase.storage.from("payment-proofs").getPublicUrl(filePath);

      console.log("File uploaded successfully, URL:", publicUrl);
      setPreviewUrl(publicUrl);
      onImageUploaded(publicUrl);
      toast.success("Transaction image uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      
      // Final fallback if everything else fails
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64String = e.target?.result as string;
          if (saveToLocalStorage(base64String)) {
            toast.warning("Using local storage as fallback");
          } else {
            toast.error("Failed to save image");
          }
        };
        reader.readAsDataURL(file);
      }
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

        {previewUrl && (
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Preview:</p>
            <img
              src={previewUrl}
              alt="Transaction preview"
              className="max-h-32 rounded border border-gray-200"
              onLoad={() => console.log("Preview image loaded successfully")}
              onError={(e) => console.error("Preview image failed to load:", e)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionImageUpload;
