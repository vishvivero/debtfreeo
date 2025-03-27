
// Utility functions for handling Supabase storage URLs

/**
 * Creates a public URL for a file in Supabase storage
 * @param bucket The storage bucket name
 * @param filePath The path to the file within the bucket
 * @returns The full public URL to the file
 */
export const getStorageUrl = (bucket: string, filePath: string): string => {
  // Use the known Supabase URL from client.ts
  const baseUrl = "https://cfbleqfvxyosenezksbc.supabase.co";
  return `${baseUrl}/storage/v1/object/public/${bucket}/${filePath}`;
};
