
import { useState } from "react";
import { FileMetadata, formatFileSize, deleteFile, updateFileExpiration } from "@/services/fileService";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Copy, Download, MoreVertical, Trash, Clock, Link as LinkIcon } from "lucide-react";

interface FileListProps {
  files: FileMetadata[];
  loading: boolean;
  onFileDeleted: (fileId: string) => void;
  onFileUpdated: (file: FileMetadata) => void;
}

export const FileList = ({ files, loading, onFileDeleted, onFileUpdated }: FileListProps) => {
  const { user } = useAuth();
  const [expirationDialogOpen, setExpirationDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileMetadata | null>(null);
  const [newExpiration, setNewExpiration] = useState<string>("never");
  const [processingFileId, setProcessingFileId] = useState<string | null>(null);

  const copyLinkToClipboard = (shareUrl: string) => {
    navigator.clipboard.writeText(shareUrl).then(
      () => {
        toast.success("Link copied to clipboard");
      },
      () => {
        toast.error("Failed to copy link");
      }
    );
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!user) return;
    
    if (!window.confirm("Are you sure you want to delete this file? This action cannot be undone.")) {
      return;
    }
    
    setProcessingFileId(fileId);
    
    try {
      const success = await deleteFile(fileId, user.id);
      
      if (success) {
        toast.success("File deleted successfully");
        onFileDeleted(fileId);
      } else {
        toast.error("Failed to delete file");
      }
    } catch (error) {
      console.error("Error deleting file:", error);
      toast.error("An error occurred while deleting the file");
    } finally {
      setProcessingFileId(null);
    }
  };

  const openExpirationDialog = (file: FileMetadata) => {
    setSelectedFile(file);
    // Set the current expiration
    if (!file.expiresAt) {
      setNewExpiration("never");
    } else {
      const daysFromNow = Math.ceil(
        (new Date(file.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysFromNow <= 1) setNewExpiration("1");
      else if (daysFromNow <= 7) setNewExpiration("7");
      else if (daysFromNow <= 30) setNewExpiration("30");
      else setNewExpiration("90");
    }
    setExpirationDialogOpen(true);
  };

  const handleUpdateExpiration = async () => {
    if (!selectedFile || !user) return;
    
    setProcessingFileId(selectedFile.id);
    
    try {
      // Convert newExpiration to days or null
      let expirationDays: number | null = null;
      if (newExpiration !== "never") {
        expirationDays = parseInt(newExpiration, 10);
      }
      
      const updatedFile = await updateFileExpiration(selectedFile.id, user.id, expirationDays);
      
      if (updatedFile) {
        toast.success("Expiration date updated");
        onFileUpdated(updatedFile);
      } else {
        toast.error("Failed to update expiration date");
      }
    } catch (error) {
      console.error("Error updating file expiration:", error);
      toast.error("An error occurred while updating the expiration date");
    } finally {
      setProcessingFileId(null);
      setExpirationDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/3 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="text-center p-8">
        <CardTitle className="mb-2">No files yet</CardTitle>
        <CardDescription className="mb-4">
          Upload your first file using the upload form above.
        </CardDescription>
      </Card>
    );
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <div className="space-y-4">
        {files.map((file) => (
          <Card key={file.id} className="link-card">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="truncate pr-8">{file.originalName}</CardTitle>
                  <CardDescription>
                    Uploaded on {formatDate(file.uploadDate)}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyLinkToClipboard(file.shareUrl)}>
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Copy link</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openExpirationDialog(file)}>
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Edit expiration</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => handleDeleteFile(file.id)}
                      disabled={processingFileId === file.id}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete file</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-sm">
                  <span className="text-muted-foreground">Size: </span>
                  <span>{formatFileSize(file.size)}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Expires: </span>
                  <span>
                    {file.expiresAt
                      ? formatDate(file.expiresAt)
                      : "Never"}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1"
                onClick={() => copyLinkToClipboard(file.shareUrl)}
              >
                <LinkIcon className="mr-2 h-4 w-4" /> Copy Link
              </Button>
              <Button size="sm" className="flex-1">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={expirationDialogOpen} onOpenChange={setExpirationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Link Expiration</DialogTitle>
            <DialogDescription>
              Choose when this shared link should expire. Select "Never" for a permanent link.
            </DialogDescription>
          </DialogHeader>
          <Select value={newExpiration} onValueChange={setNewExpiration}>
            <SelectTrigger>
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
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setExpirationDialogOpen(false)}
              disabled={processingFileId === selectedFile?.id}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateExpiration}
              disabled={processingFileId === selectedFile?.id}
            >
              {processingFileId === selectedFile?.id ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
