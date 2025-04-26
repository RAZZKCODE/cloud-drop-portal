
import { toast } from "sonner";

export interface FileMetadata {
  id: string;
  userId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  size: number;
  uploadDate: Date;
  shareUrl: string;
  expiresAt: Date | null;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock database of files
let mockFiles: FileMetadata[] = [
  {
    id: "file-1",
    userId: "user-123",
    fileName: "document-123456.pdf",
    originalName: "Project Report.pdf",
    fileType: "application/pdf",
    size: 2500000, // 2.5MB
    uploadDate: new Date(Date.now() - 86400000 * 2), // 2 days ago
    shareUrl: "https://clouddrop.example/share/document-123456",
    expiresAt: new Date(Date.now() + 86400000 * 5) // 5 days from now
  },
  {
    id: "file-2",
    userId: "user-123",
    fileName: "image-789012.jpg",
    originalName: "Vacation Photo.jpg",
    fileType: "image/jpeg",
    size: 3800000, // 3.8MB
    uploadDate: new Date(Date.now() - 86400000), // 1 day ago
    shareUrl: "https://clouddrop.example/share/image-789012",
    expiresAt: null // Never expires
  }
];

export const uploadFile = async (
  file: File,
  userId: string,
  expiresIn: number | null = null // null means never expire, otherwise days
): Promise<FileMetadata> => {
  // Validate file size (max 50MB)
  const maxSize = 50 * 1024 * 1024; // 50MB in bytes
  if (file.size > maxSize) {
    throw new Error("File size exceeds the maximum limit of 50MB");
  }

  // Simulate uploading to cloud storage
  await delay(file.size / 100000); // Simulate longer uploads for larger files

  // Generate a unique file ID and "cloud" filename
  const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const cloudFileName = `${file.name.split(".")[0].toLowerCase()}-${fileId}.${file.name.split(".").pop()}`;
  
  // Calculate expiration date if provided
  let expiresAt = null;
  if (expiresIn !== null) {
    expiresAt = new Date(Date.now() + expiresIn * 86400000);
  }

  // Create file metadata
  const newFile: FileMetadata = {
    id: fileId,
    userId,
    fileName: cloudFileName,
    originalName: file.name,
    fileType: file.type,
    size: file.size,
    uploadDate: new Date(),
    shareUrl: `https://clouddrop.example/share/${fileId}`,
    expiresAt
  };

  // Add to our mock database
  mockFiles.push(newFile);

  return newFile;
};

export const getUserFiles = async (userId: string): Promise<FileMetadata[]> => {
  // Simulate API delay
  await delay(500);
  
  // Filter files by user ID and remove expired ones
  return mockFiles
    .filter(file => file.userId === userId)
    .filter(file => !file.expiresAt || new Date(file.expiresAt) > new Date())
    .sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime()); // Sort newest first
};

export const deleteFile = async (fileId: string, userId: string): Promise<boolean> => {
  await delay(500);
  
  const initialLength = mockFiles.length;
  mockFiles = mockFiles.filter(file => !(file.id === fileId && file.userId === userId));
  
  return mockFiles.length < initialLength;
};

export const updateFileExpiration = async (
  fileId: string,
  userId: string,
  expiresIn: number | null
): Promise<FileMetadata | null> => {
  await delay(300);
  
  const fileIndex = mockFiles.findIndex(file => file.id === fileId && file.userId === userId);
  
  if (fileIndex === -1) {
    return null;
  }
  
  let expiresAt = null;
  if (expiresIn !== null) {
    expiresAt = new Date(Date.now() + expiresIn * 86400000);
  }
  
  mockFiles[fileIndex] = {
    ...mockFiles[fileIndex],
    expiresAt
  };
  
  return mockFiles[fileIndex];
};

export const getFileByShareId = async (fileId: string): Promise<FileMetadata | null> => {
  await delay(300);
  
  const file = mockFiles.find(file => file.id === fileId);
  
  if (!file) {
    return null;
  }
  
  // Check if file has expired
  if (file.expiresAt && new Date(file.expiresAt) < new Date()) {
    return null;
  }
  
  return file;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + ' bytes';
  } else if (bytes < 1048576) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else if (bytes < 1073741824) {
    return (bytes / 1048576).toFixed(1) + ' MB';
  } else {
    return (bytes / 1073741824).toFixed(1) + ' GB';
  }
};
