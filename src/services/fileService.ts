import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface FileMetadata {
  id: string;
  userId: string;
  originalName: string;
  fileType: string;
  size: number;
  uploadDate: Date;
  shareUrl: string;
  expiresAt: Date | null;
}

export const uploadFile = async (
  file: File,
  userId: string,
  expiresIn: number | null = null
): Promise<FileMetadata> => {
  // Validate file size (max 50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error("File size exceeds the maximum limit of 50MB");
  }

  // Generate a unique file path
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

  try {
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('file_uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Generate public URL
    const { data: urlData } = await supabase.storage
      .from('file_uploads')
      .createSignedUrl(filePath, expiresIn ? expiresIn * 24 * 60 * 60 : 365 * 24 * 60 * 60);

    if (!urlData?.signedUrl) throw new Error("Failed to generate share URL");

    // Insert metadata into the database
    const { data: metadataData, error: metadataError } = await supabase
      .from('file_metadata')
      .insert({
        user_id: userId,
        storage_path: filePath,
        original_name: file.name,
        file_type: file.type,
        size: file.size,
        share_url: urlData.signedUrl,
        expires_at: expiresIn ? new Date(Date.now() + expiresIn * 86400000) : null
      })
      .select()
      .single();

    if (metadataError) throw metadataError;

    return {
      id: metadataData.id,
      userId: metadataData.user_id,
      originalName: metadataData.original_name,
      fileType: metadataData.file_type,
      size: metadataData.size,
      uploadDate: new Date(metadataData.upload_date),
      shareUrl: metadataData.share_url,
      expiresAt: metadataData.expires_at ? new Date(metadataData.expires_at) : null
    };
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const getUserFiles = async (userId: string): Promise<FileMetadata[]> => {
  const { data, error } = await supabase
    .from('file_metadata')
    .select('*')
    .eq('user_id', userId)
    .order('upload_date', { ascending: false });

  if (error) throw error;

  return data.map(file => ({
    id: file.id,
    userId: file.user_id,
    originalName: file.original_name,
    fileType: file.file_type,
    size: file.size,
    uploadDate: new Date(file.upload_date),
    shareUrl: file.share_url,
    expiresAt: file.expires_at ? new Date(file.expires_at) : null
  }));
};

export const deleteFile = async (fileId: string, userId: string): Promise<boolean> => {
  try {
    // Get the file metadata first
    const { data: fileData, error: fetchError } = await supabase
      .from('file_metadata')
      .select('storage_path')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Delete the file from storage
    const { error: storageError } = await supabase.storage
      .from('file_uploads')
      .remove([fileData.storage_path]);

    if (storageError) throw storageError;

    // Delete the metadata
    const { error: deleteError } = await supabase
      .from('file_metadata')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId);

    if (deleteError) throw deleteError;

    return true;
  } catch (error) {
    console.error('Delete error:', error);
    return false;
  }
};

export const updateFileExpiration = async (
  fileId: string,
  userId: string,
  expiresIn: number | null
): Promise<FileMetadata | null> => {
  try {
    const { data: fileData, error: fetchError } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)
      .single();

    if (fetchError) throw fetchError;

    // Generate new signed URL
    const { data: urlData } = await supabase.storage
      .from('file_uploads')
      .createSignedUrl(fileData.storage_path, expiresIn ? expiresIn * 24 * 60 * 60 : 365 * 24 * 60 * 60);

    if (!urlData?.signedUrl) throw new Error("Failed to generate new share URL");

    const { data: updateData, error: updateError } = await supabase
      .from('file_metadata')
      .update({
        share_url: urlData.signedUrl,
        expires_at: expiresIn ? new Date(Date.now() + expiresIn * 86400000) : null
      })
      .eq('id', fileId)
      .eq('user_id', userId)
      .select()
      .single();

    if (updateError) throw updateError;

    return {
      id: updateData.id,
      userId: updateData.user_id,
      originalName: updateData.original_name,
      fileType: updateData.file_type,
      size: updateData.size,
      uploadDate: new Date(updateData.upload_date),
      shareUrl: updateData.share_url,
      expiresAt: updateData.expires_at ? new Date(updateData.expires_at) : null
    };
  } catch (error) {
    console.error('Update error:', error);
    return null;
  }
};

export const getFileByShareId = async (fileId: string): Promise<FileMetadata | null> => {
  try {
    const { data: fileData, error: fetchError } = await supabase
      .from('file_metadata')
      .select('*')
      .eq('id', fileId)
      .single();

    if (fetchError || !fileData) {
      return null;
    }

    return {
      id: fileData.id,
      userId: fileData.user_id,
      originalName: fileData.original_name,
      fileType: fileData.file_type,
      size: fileData.size,
      uploadDate: new Date(fileData.upload_date),
      shareUrl: fileData.share_url,
      expiresAt: fileData.expires_at ? new Date(fileData.expires_at) : null
    };
  } catch (error) {
    console.error("Error fetching shared file:", error);
    return null;
  }
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
