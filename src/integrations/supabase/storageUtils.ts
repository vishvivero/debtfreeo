
// Utility functions for handling Supabase storage URLs

/**
 * Creates a public URL for a file in Supabase storage
 * @param bucket The storage bucket name
 * @param filePath The path to the file within the bucket
 * @returns The full public URL to the file
 */
export const getStorageUrl = (bucket: string, filePath: string): string => {
  if (!filePath) return '';
  
  // Check if the URL is already a full URL (starts with http)
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
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
    
    // Generate file name if not provided
    const finalFileName = fileName || `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    const contentType = file.type || `image/${file.name.split('.').pop()}`;
    
    console.log(`Uploading ${finalFileName} with content type ${contentType}`);
    
    // First check if bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.find(b => b.name === bucket);
      
      if (!bucketExists) {
        console.log(`Bucket ${bucket} doesn't exist. Creating...`);
        
        // Try to create the bucket via edge function
        const { data: createResult, error: createError } = await supabase.functions.invoke('create-blog-images-bucket');
        
        if (createError) {
          console.error("Error creating bucket via edge function:", createError);
          throw new Error(`Failed to create ${bucket} bucket: ${createError.message}`);
        }
        
        console.log("Bucket creation result:", createResult);
        
        // Wait a moment for the bucket to be available
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error("Error checking/creating bucket:", error);
      // Continue anyway, the upload might still work
    }
    
    // Try to upload the file
    let uploadAttempts = 0;
    let uploadResult = null;
    
    while (uploadAttempts < 3) {
      uploadAttempts++;
      console.log(`Upload attempt ${uploadAttempts} for ${finalFileName}`);
      
      try {
        if (uploadAttempts === 1) {
          // First attempt: standard upload
          const result = await supabase.storage
            .from(bucket)
            .upload(finalFileName, file, {
              cacheControl: '3600',
              upsert: true,
              contentType
            });
            
          if (!result.error) {
            uploadResult = result;
            break;
          }
          
          console.error(`Attempt ${uploadAttempts} failed:`, result.error);
        } else if (uploadAttempts === 2) {
          // Second attempt: try with Blob
          const blob = new Blob([await file.arrayBuffer()], { type: contentType });
          const result = await supabase.storage
            .from(bucket)
            .upload(finalFileName, blob, {
              cacheControl: '3600',
              upsert: true,
              contentType
            });
            
          if (!result.error) {
            uploadResult = result;
            break;
          }
          
          console.error(`Attempt ${uploadAttempts} failed:`, result.error);
        } else {
          // Third attempt: try with base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => {
              const base64 = reader.result as string;
              resolve(base64.split(',')[1]); // Remove the prefix
            };
          });
          
          reader.readAsDataURL(file);
          const base64Data = await base64Promise;
          
          // Convert base64 to Uint8Array
          const binaryData = atob(base64Data);
          const uint8Array = new Uint8Array(binaryData.length);
          for (let i = 0; i < binaryData.length; i++) {
            uint8Array[i] = binaryData.charCodeAt(i);
          }
          
          const result = await supabase.storage
            .from(bucket)
            .upload(finalFileName, uint8Array, {
              cacheControl: '3600',
              upsert: true,
              contentType
            });
            
          if (!result.error) {
            uploadResult = result;
            break;
          }
          
          console.error(`Attempt ${uploadAttempts} failed:`, result.error);
        }
      } catch (uploadError) {
        console.error(`Upload attempt ${uploadAttempts} exception:`, uploadError);
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (!uploadResult) {
      console.error("All upload attempts failed");
      return null;
    }
    
    console.log("Image uploaded successfully:", finalFileName);
    return finalFileName;
  } catch (error) {
    console.error("Fatal error during file upload:", error);
    return null;
  }
};
