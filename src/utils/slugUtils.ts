/**
 * Slug Utility Functions
 * Converts long UUIDs to short, SEO-friendly product slugs
 * Example: "0e05e2bb-806f-4e37-9d66-389bc56bd2af" + "Premium T-Shirt" = "premium-tshirt-0e05"
 */

/**
 * Generate a short, URL-friendly product slug
 * @param productName - The name of the product
 * @param productId - The full UUID of the product
 * @returns Short slug like "premium-tshirt-0e05"
 */
export const generateProductSlug = (productName: string, productId: string): string => {
  // Convert name to lowercase and remove special characters
  const slug = productName
    .toLowerCase()
    .trim()
    .replace(/[^
\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  // Get first 4 characters of UUID as short ID
  const shortId = productId.substring(0, 4).toLowerCase();

  return `${slug}-${shortId}`;
};

/**
 * Extract the short ID from a product slug
 * @param slug - Slug like "premium-tshirt-0e05"
 * @returns Short ID like "0e05"
 */
export const extractShortIdFromSlug = (slug: string): string => {
  const parts = slug.split('-');
  return parts[parts.length - 1];
};

/**
 * Check if a string is a UUID format
 * @param str - String to check
 * @returns true if it's a valid UUID format
 */
export const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * Generate the full product URL
 * @param storeName - Store name from URL slug
 * @param productSlug - Product slug
 * @param baseUrl - Optional base URL (defaults to window.location.origin)
 * @returns Full product URL
 */
export const generateProductUrl = (
  storeName: string,
  productSlug: string,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'https://example.com'
): string => {
  return `${baseUrl}/store/${storeName}/product/${productSlug}`;
};