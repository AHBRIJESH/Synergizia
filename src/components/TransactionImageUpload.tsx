import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { Upload } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { saveImageToLocalStorage, getImageFromLocalStorage } from "@/utils/localStorageUtils";

interface TransactionImageUploadProps {
  registrationId: string;
  onImageUploaded: (imageUrl: string) => void;
  userName?: string;
}

const TransactionImageUpload: React.FC<TransactionImageUploadProps> = ({
  registrationId,
  onImageUploaded,
  userName = "unknown",
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

      // Generate filename with user's name and timestamp
      const timestamp = new Date().getTime();
      const fileExt = file.name.split(".").pop();
      const fileName = `${userName.replace(/\s+/g, '_')}_${timestamp}.${fileExt}`;

      // Check if Supabase is properly configured
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      // If Supabase is not configured or fails, use local storage
      if (!supabaseUrl || !supabaseAnonKey) {
        console.log("Supabase not configured, using localStorage as fallback");
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = e.target?.result as string;
          if (await saveImageToLocalStorage(registrationId, base64String, fileName)) {
            toast.success("Image saved successfully");
            setPreviewUrl(base64String);
            onImageUploaded(base64String);
          } else {
            toast.error("Failed to save image");
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // Try uploading to Supabase first
      const filePath = `${registrationId}/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from("payment-proofs")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("Error uploading to Supabase:", uploadError);
        
        // Fallback to local storage
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64String = e.target?.result as string;
          if (await saveImageToLocalStorage(registrationId, base64String, fileName)) {
            toast.warning("Cloud storage failed. Image saved locally.");
            setPreviewUrl(base64String);
            onImageUploaded(base64String);
          } else {
            toast.error("Failed to save image");
          }
        };
        reader.readAsDataURL(file);
        return;
      }

      // Get public URL if upload succeeded
      const { data: { publicUrl } } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(filePath);

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
        reader.onload = async (e) => {
          const base64String = e.target?.result as string;
          const fileName = `${userName.replace(/\s+/g, '_')}_${Date.now()}.${file.name.split('.').pop()}`;
          if (await saveImageToLocalStorage(registrationId, base64String, fileName)) {
            toast.warning("Using local storage as fallback");
            setPreviewUrl(base64String);
            onImageUploaded(base64String);
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
