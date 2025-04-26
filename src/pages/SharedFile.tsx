import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getFileByShareId, FileMetadata, formatFileSize } from "@/services/fileService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, FileIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SharedFile = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [file, setFile] = useState<FileMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      if (!fileId) {
        setError("No file ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data: fileData, error: fetchError } = await supabase
          .from('file_metadata')
          .select('*')
          .eq('id', fileId)
          .single();

        if (fetchError || !fileData) {
          setError("This file doesn't exist or has expired");
        } else {
          setFile({
            id: fileData.id,
            userId: fileData.user_id,
            originalName: fileData.original_name,
            fileType: fileData.file_type,
            size: fileData.size,
            uploadDate: new Date(fileData.upload_date),
            shareUrl: fileData.share_url,
            expiresAt: fileData.expires_at ? new Date(fileData.expires_at) : null
          });
        }
      } catch (err) {
        console.error("Error fetching shared file:", err);
        setError("Failed to load file. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [fileId]);

  const handleDownload = async () => {
    if (!file) return;
    
    try {
      window.location.href = file.shareUrl;
      toast.success("Download started");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-900 to-cyan-800 p-4">
        <div className="text-white">Loading file details...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-900 to-cyan-800 p-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white">CloudDrop</h1>
          </Link>
          <p className="mt-2 text-sky-200">Secure file sharing</p>
        </div>

        {error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">File Not Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{error}</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link to="/">Back to Home</Link>
              </Button>
            </CardFooter>
          </Card>
        ) : file ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileIcon className="mr-2 h-6 w-6" />
                <span className="truncate">{file.originalName}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{file.fileType.split('/')[1].toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires:</span>
                  <span>
                    {file.expiresAt 
                      ? new Date(file.expiresAt).toLocaleDateString() 
                      : "Never expires"}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleDownload} className="w-full">
                <Download className="mr-2 h-4 w-4" /> Download File
              </Button>
            </CardFooter>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default SharedFile;
