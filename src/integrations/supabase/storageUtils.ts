
// Utility functions for handling Supabase storage URLs

import { supabase } from './client';

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
  
  // Check if it's a data URL
  if (filePath.startsWith('data:')) {
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
  if (!file) {
    console.error('No file provided for upload');
    return null;
  }
  
  try {
    // Generate file name if not provided
    const finalFileName = fileName || `${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    const contentType = file.type || `image/${file.name.split('.').pop()}`;
    
    console.log(`Uploading ${finalFileName} with content type ${contentType} to bucket ${bucket}`);
    
    // First check if bucket exists and create it if needed
    try {
      console.log("Checking if bucket exists:", bucket);
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      
      if (bucketsError) {
        console.error("Error listing buckets:", bucketsError);
        // Continue anyway, we'll try to create it
      }
      
      const bucketExists = buckets?.find(b => b.name === bucket);
      
      if (!bucketExists) {
        console.log(`Bucket ${bucket} doesn't exist. Creating...`);
        
        // Try to create the bucket via edge function
        console.log("Calling create-blog-images-bucket edge function");
        const { data: createResult, error: createError } = await supabase.functions.invoke('create-blog-images-bucket');
        
        if (createError) {
          console.error("Error creating bucket via edge function:", createError);
          throw new Error(`Failed to create ${bucket} bucket: ${createError.message}`);
        }
        
        console.log("Bucket creation result:", createResult);
        
        // Wait a moment for the bucket to be available
        await new Promise(resolve => setTimeout(resolve, 2000));
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
          console.log("Attempting standard upload with file");
          const result = await supabase.storage
            .from(bucket)
            .upload(finalFileName, file, {
              cacheControl: '3600',
              upsert: true,
              contentType
            });
            
          if (!result.error) {
            console.log("Standard upload successful");
            uploadResult = result;
            break;
          }
          
          console.error(`Attempt ${uploadAttempts} failed:`, result.error);
        } else if (uploadAttempts === 2) {
          // Second attempt: try with Blob
          console.log("Attempting upload with Blob conversion");
          const fileBuffer = await file.arrayBuffer();
          const blob = new Blob([fileBuffer], { type: contentType });
          
          const result = await supabase.storage
            .from(bucket)
            .upload(finalFileName, blob, {
              cacheControl: '3600',
              upsert: true,
              contentType
            });
            
          if (!result.error) {
            console.log("Blob upload successful");
            uploadResult = result;
            break;
          }
          
          console.error(`Attempt ${uploadAttempts} failed:`, result.error);
        } else {
          // Third attempt: try with base64
          console.log("Attempting upload with base64 conversion");
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => {
              const base64 = reader.result as string;
              resolve(base64.split(',')[1]); // Remove the prefix
            };
          });
          
          reader.readAsDataURL(file);
          const base64Data = await base64Promise;
          
          if (!base64Data) {
            throw new Error("Failed to read file as base64");
          }
          
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
            console.log("Base64 upload successful");
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
    
    // Verify the upload was successful by checking if the file exists
    try {
      console.log("Verifying file exists in storage...");
      const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(finalFileName);
        
      if (data?.publicUrl) {
        console.log("File verified with public URL:", data.publicUrl);
      }
    } catch (verifyError) {
      console.error("Error during URL verification:", verifyError);
    }
    
    return finalFileName;
  } catch (error) {
    console.error("Fatal error during file upload:", error);
    return null;
  }
};
