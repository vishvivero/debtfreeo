
export const calculateReadTime = (content: string): number => {
  console.log("Starting read time calculation");
  console.log("Original content length:", content.length);
  
  const strippedContent = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[#*_~`]/g, '') // Remove markdown symbols
    .replace(/\[\[.*?\]\]/g, '') // Remove markdown links
    .replace(/\(.*?\)/g, ''); // Remove parentheses content
  
  console.log("Content after stripping HTML/markdown:", strippedContent);
  
  const words = strippedContent
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  console.log("Word count:", words.length);
  
  const wordsPerMinute = 225;
  console.log("Words per minute:", wordsPerMinute);
  
  const readTime = Math.ceil(words.length / wordsPerMinute);
  console.log("Calculated read time (minutes):", readTime);
  
  const finalReadTime = Math.max(1, readTime);
  console.log("Final read time (minutes):", finalReadTime);
  
  return finalReadTime;
};
