import { v4 as uuidv4 } from 'uuid';
import { db } from '../db.js';
import { verifyGoogleIdToken } from '../services/googleAuth.js';

/**
 * Handle Google OAuth Sign-In and Sign-Up
 * Validates Google ID token cryptographically, verifies email claim, 
 * links existing accounts safely or provisions new user, and issues application JWT session.
 */
export async function handleGoogleAuth(req, res, createToken) {
  try {
    const { credential, token, idToken } = req.body;
    const rawToken = credential || token || idToken;

    if (!rawToken) {
      return res.status(400).json({ error: 'Google ID token or credential is required' });
    }

    // 1. Cryptographically verify Google ID token
    let googlePayload;
    try {
      googlePayload = await verifyGoogleIdToken(rawToken);
    } catch (verifyErr) {
      console.warn('[Google Auth] Token verification rejected:', verifyErr.message);
      return res.status(401).json({ error: `Google verification failed: ${verifyErr.message}` });
    }

    const { sub: googleId, email, name, picture, emailVerified } = googlePayload;

    // 2. Critical Requirement: Check email is verified by Google
    if (!emailVerified) {
      return res.status(401).json({ error: 'Your Google email is unverified. Only verified Google accounts can sign in.' });
    }

    // 3. Search for existing user by Google sub ID
    let user = db.get('users').find(u => u.googleId === googleId);

    // 4. If not found by Google ID, search by verified email to securely link accounts
    if (!user) {
      user = db.get('users').find(u => u.email && u.email.toLowerCase() === email);

      if (user) {
        console.log(`[Google Auth] Securely linking existing user account (${email}) with Google ID: ${googleId}`);
        const updates = {
          googleId,
          emailVerified: true,
          lastLogin: new Date().toISOString()
        };
        if (!user.avatar && picture) {
          updates.avatar = picture;
        }
        user = db.update('users', user.id, updates) || { ...user, ...updates };
      }
    } else {
      // Existing Google user login: update last login timestamp and avatar if available
      const updates = {
        lastLogin: new Date().toISOString()
      };
      if (picture && !user.avatar) {
        updates.avatar = picture;
      }
      user = db.update('users', user.id, updates) || { ...user, ...updates };
    }

    // 5. If new user, create account in MongoDB and local store
    if (!user) {
      const newUser = {
        id: `usr_${uuidv4().slice(0, 8)}`,
        name: name || email.split('@')[0],
        email: email,
        googleId: googleId,
        avatar: picture || '',
        authProvider: 'google',
        emailVerified: true,
        role: 'customer',
        phone: '',
        city: 'Bengaluru',
        address: '',
        depositBalance: 0,
        upiId: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      user = db.insert('users', newUser);
      console.log(`[Google Auth] Created new genuine Google user: ${email} (ID: ${user.id})`);
    }

    // 6. Issue secure application JWT token
    const appToken = createToken(user);
    const { password: _, ...userWithoutPw } = user;

    return res.status(200).json({
      message: 'Google authentication successful',
      user: userWithoutPw,
      token: appToken
    });
  } catch (err) {
    console.error('[Google Auth] Unexpected error during Google authentication:', err);
    return res.status(500).json({ error: 'Internal server error during Google authentication' });
  }
}
