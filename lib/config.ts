export const config = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const;

// Helper function to get the appropriate URL
export function getSiteUrl(request?: Request): string {
  if (request) {
    const { origin } = new URL(request.url);
    return process.env.NEXT_PUBLIC_SITE_URL || origin;
  }
  return config.siteUrl;
} 