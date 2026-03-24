import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

interface LogoUploadProps {
  currentUrl?: string | null;
  vendorId?: string;
  onUpload: (url: string) => void;
}

const LogoUpload = ({ currentUrl, vendorId, onUpload }: LogoUploadProps) => {
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED.includes(file.type)) {
      toast.error("Only PNG, JPEG, or WEBP files are allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File must be under 2MB.");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop() || "png";
    const path = `${vendorId || crypto.randomUUID()}.${ext}`;

    const { error } = await supabase.storage
      .from("vendor-logos")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error(error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("vendor-logos")
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;
    setPreview(publicUrl);
    onUpload(publicUrl);
    setUploading(false);
    toast.success("Logo uploaded!");
  };

  return (
    <div className="flex items-center gap-4">
      {preview ? (
        <img src={preview} alt="Logo" className="w-16 h-16 rounded-lg object-cover border" />
      ) : (
        <div className="w-16 h-16 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground">
          <Upload className="h-5 w-5" />
        </div>
      )}
      <div className="space-y-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Upload className="h-4 w-4 mr-1" />}
          {uploading ? "Uploading..." : "Upload Logo"}
        </Button>
        <p className="text-xs text-muted-foreground">PNG, JPEG, WEBP · max 2MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
};

export default LogoUpload;
