
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getUserFiles, FileMetadata } from "@/services/fileService";
import { Layout } from "@/components/Layout";
import { FileUploader } from "@/components/FileUploader";
import { FileList } from "@/components/FileList";
import { toast } from "sonner";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  const fetchFiles = async () => {
    if (!user) return;
    
    setLoadingFiles(true);
    try {
      const userFiles = await getUserFiles(user.id);
      setFiles(userFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
      toast.error("Failed to load your files. Please try again.");
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchFiles();
    }
  }, [user]);

  const handleFileUploaded = (file: FileMetadata) => {
    setFiles(prevFiles => [file, ...prevFiles]);
  };

  const handleFileDeleted = (fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const handleFileUpdated = (updatedFile: FileMetadata) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === updatedFile.id ? updatedFile : file
      )
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <Layout>
      <div className="container mx-auto py-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Your Files</h1>
        
        <FileUploader onFileUploaded={handleFileUploaded} />
        
        <div className="mt-8">
          <FileList 
            files={files}
            loading={loadingFiles}
            onFileDeleted={handleFileDeleted}
            onFileUpdated={handleFileUpdated}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
