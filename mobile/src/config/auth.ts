/**
 * Public client config — mirrors frontend App.jsx GoogleOAuthProvider clientId.
 * This is a public OAuth client ID (already shipped in the web app).
 */
export const GOOGLE_WEB_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
  '829742825170-qu62f7f662o16iv6hcpgcep8g80fotb9.apps.googleusercontent.com';

export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || '';
export const GOOGLE_ANDROID_CLIENT_ID =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || '';
