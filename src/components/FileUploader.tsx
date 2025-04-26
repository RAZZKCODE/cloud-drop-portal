import { useState, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile, FileMetadata } from "@/services/fileService";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

interface FileUploaderProps {
  onFileUploaded: (file: FileMetadata) => void;
}

export const FileUploader = ({ onFileUploaded }: FileUploaderProps) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [expiresIn, setExpiresIn] = useState<string>("never");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (fileToValidate: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (fileToValidate.size > maxSize) {
      toast.error("File size exceeds the maximum limit of 50MB");
      return;
    }
    
    setFile(fileToValidate);
  };

  const handleClearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setIsUploading(true);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const uploadedFile = await uploadFile(file, user.id, expiresIn !== "never" ? parseInt(expiresIn, 10) : null);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast.success("File uploaded successfully!");
      onFileUploaded(uploadedFile);
      
      setTimeout(() => {
        setFile(null);
        setProgress(0);
        setExpiresIn("never");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div
          className={`dropzone ${isDragging ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-medium">File selected:</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleClearFile} disabled={isUploading}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {isUploading ? (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="progress-animate" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-2">Link expiration:</p>
                    <Select 
                      value={expiresIn}
                      onValueChange={setExpiresIn}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select expiration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never expires</SelectItem>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button onClick={handleUpload} className="w-full">
                    Upload File
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 font-medium">Drag and drop a file here</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Or click to browse (max 50MB)
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => fileInputRef.current?.click()}
              >
                Browse Files
              </Button>
              <input
                type="file"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
