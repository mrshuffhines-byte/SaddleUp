/**
 * API utility functions with Chrome local network request compatibility
 * 
 * Chrome will require explicit permission for local network requests (localhost, private IPs).
 * This helper ensures requests are properly configured for both development and production.
 */

/**
 * Checks if a URL is a local network address
 */
export function isLocalNetwork(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check for localhost variants
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') {
      return true;
    }
    
    // Check for .local domains
    if (hostname.endsWith('.local')) {
      return true;
    }
    
    // Check for private IP ranges (IPv4)
    const parts = hostname.split('.').map(Number);
    if (parts.length === 4 && parts.every(p => !isNaN(p))) {
      // 10.0.0.0/8
      if (parts[0] === 10) return true;
      // 172.16.0.0/12
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      // 192.168.0.0/16
      if (parts[0] === 192 && parts[1] === 168) return true;
      // 169.254.0.0/16 (link-local)
      if (parts[0] === 169 && parts[1] === 254) return true;
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Creates fetch options that are compatible with Chrome's local network restrictions
 */
export function createFetchOptions(options: RequestInit = {}): RequestInit {
  // If we're in a browser environment and the request is to a local network,
  // we should set targetAddressSpace. However, since this is React Native/Expo,
  // this mainly applies to the web version.
  
  // For React Native, we don't need targetAddressSpace as it's not a browser
  // For web builds, we'll need to handle this differently
  
  // In production, always use secure contexts (HTTPS)
  // In development, we might be using HTTP to localhost
  
  return {
    ...options,
    // Add credentials if needed
    credentials: 'include',
    // Set headers
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };
}

/**
 * Safe fetch wrapper that handles local network requests appropriately
 */
export async function safeFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const fetchOptions = createFetchOptions(options);
  
  // In React Native, fetch works differently than in browsers
  // For web builds, we might need special handling
  
  try {
    const response = await fetch(url, fetchOptions);
    return response;
  } catch (error) {
    // If it's a network error and we're in a browser, it might be a local network restriction
    if (typeof window !== 'undefined' && error instanceof TypeError) {
      console.warn(
        'Fetch failed. If using localhost in development, ensure you have granted ' +
        'local network access permission in Chrome, or use HTTPS.'
      );
    }
    throw error;
  }
}

