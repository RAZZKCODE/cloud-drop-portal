
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FileMetadata, formatFileSize, getFileByShareId } from "@/services/fileService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Download, Share2, Copy, FileIcon } from "lucide-react";
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

  const handleDownload = () => {
    if (!file?.shareUrl) return;
    window.location.href = file.shareUrl;
    toast.success("Download started");
  };

  const handleCopyLink = () => {
    if (!file) return;
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    toast.success("Link copied to clipboard");
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
          <Card className="backdrop-blur-sm bg-white/95">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileIcon className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl break-all">{file.originalName}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium">{file.fileType.split('/')[1].toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uploaded:</span>
                  <span className="font-medium">
                    {file.uploadDate.toLocaleDateString()}
                  </span>
                </div>
                {file.expiresAt && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expires:</span>
                    <span className="font-medium">
                      {file.expiresAt.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-2">
              <Button 
                onClick={handleDownload} 
                className="w-full"
                size="lg"
              >
                <Download className="mr-2 h-5 w-5" />
                Download File
              </Button>
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCopyLink}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Link
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: file.originalName,
                        url: window.location.href,
                      }).catch(console.error);
                    } else {
                      handleCopyLink();
                    }
                  }}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardFooter>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default SharedFile;
