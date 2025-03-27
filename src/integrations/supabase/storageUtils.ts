
// Utility functions for handling Supabase storage URLs

/**
 * Creates a public URL for a file in Supabase storage
 * @param bucket The storage bucket name
 * @param filePath The path to the file within the bucket
 * @returns The full public URL to the file
 */
export const getStorageUrl = (bucket: string, filePath: string): string => {
  // Use the environment variable or fallback to the known Supabase URL
  const baseUrl = "https://cfbleqfvxyosenezksbc.supabase.co";
  return `${baseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
};

/**
 * Handles uploading an image to Supabase storage with multiple fallback attempts
 * @param bucket The storage bucket name
 * @param file The file to upload
 * @param fileName Optional custom filename
 * @returns Promise with the uploaded file path or null if failed
 */
export const uploadImageToStorage = async (bucket: string, file: File, fileName?: string): Promise<string | null> => {
  if (!file) return null;
  
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    // Ensure the bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(b => b.name === bucket)) {
        console.log(`Creating ${bucket} bucket first...`);
        await supabase.functions.invoke('create-blog-images-bucket');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay
      }
    } catch (error) {
      console.error("Error checking/creating bucket:", error);
    }
    
    // Generate file name if not provided
    const finalFileName = fileName || `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    const contentType = file.type || `image/${file.name.split('.').pop()}`;
    
    console.log(`Uploading ${finalFileName} with content type ${contentType}`);
    
    // First attempt: standard upload
    let result = await supabase.storage
      .from(bucket)
      .upload(finalFileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType
      });
    
    if (result.error) {
      console.error("First upload attempt failed:", result.error);
      
      // Second attempt: try with Blob
      const blob = new Blob([await file.arrayBuffer()], { type: contentType });
      result = await supabase.storage
        .from(bucket)
        .upload(finalFileName, blob, {
          cacheControl: '3600',
          upsert: true,
          contentType
        });
      
      if (result.error) {
        console.error("Second upload attempt failed:", result.error);
        return null;
      }
    }
    
    // Verify upload and return path
    return finalFileName;
  } catch (error) {
    console.error("Fatal error during file upload:", error);
    return null;
  }
};
