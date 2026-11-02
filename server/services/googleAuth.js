import { OAuth2Client } from 'google-auth-library';

// We lazy-init or use the client with environment variable GOOGLE_CLIENT_ID
export async function verifyGoogleIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Google ID token is required');
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '938924164898-ch4lvils61jkqp39cfl23pn2rkgrfggp.apps.googleusercontent.com';

  const client = new OAuth2Client(clientId);

  // verifyIdToken cryptographically verifies:
  // 1. Signature against Google's live public keys (certs.googleapis.com)
  // 2. Audience matches GOOGLE_CLIENT_ID
  // 3. Expiration time (exp claim > current time)
  // 4. Issuer is accounts.google.com or https://accounts.google.com
  const ticket = await client.verifyIdToken({
    idToken,
    audience: clientId
  });

  const payload = ticket.getPayload();
  if (!payload) {
    throw new Error('Invalid Google token: failed to extract payload');
  }

  // Validate the email_verified claim directly from Google's signed payload
  if (payload.email_verified !== true) {
    throw new Error('Google email is not verified. Unverified accounts cannot sign in.');
  }

  // Validate issuer
  const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
  if (!validIssuers.includes(payload.iss)) {
    throw new Error('Invalid token issuer. Untrusted authentication source.');
  }

  return {
    sub: payload.sub, // Unique Google Account ID
    email: (payload.email || '').toLowerCase().trim(),
    name: payload.name || payload.given_name || 'Google User',
    picture: payload.picture || '',
    emailVerified: payload.email_verified
  };
}
