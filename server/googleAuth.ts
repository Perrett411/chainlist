// Google OAuth integration for Perrett & Associates platform
// Adapted from blueprint:flask_google_oauth for Node.js/Express

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Express, RequestHandler } from "express";
import { storage } from "./storage";
import type { AuthenticatedRequest, PassportUser, GoogleProfile } from "./types";

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_OAUTH_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || process.env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn(`
⚠️  Google OAuth Setup Required:
1. Go to https://console.cloud.google.com/apis/credentials
2. Create a new OAuth 2.0 Client ID
3. Add your Replit domain to Authorized redirect URIs:
   Format: https://YOUR_DOMAIN/api/auth/google/callback
4. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables

For detailed instructions, see:
https://docs.replit.com/additional-resources/google-auth-in-flask#set-up-your-oauth-app--client
  `);
}

export function setupGoogleAuth(app: Express) {
  // Only setup if credentials are available
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.log("Google OAuth not configured - skipping setup");
    return;
  }

  // Configure Google OAuth strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/auth/google/callback",
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await storage.getUserByGoogleId(profile.id);
          
          if (!user) {
            // Check if user exists with same email from other provider
            user = await storage.getUserByEmail(profile.emails?.[0]?.value || '');
            
            if (user) {
              // Link Google account to existing user
              user = await storage.upsertUser({
                ...user,
                googleId: profile.id,
                authProvider: 'google',
                lastLoginAt: new Date(),
                updatedAt: new Date(),
              });
            } else {
              // Create new user
              let role = 'user';
              let permissions = ['read'];
              
              // Admin users for Perrett & Associates
              const email = profile.emails?.[0]?.value || '';
              if (email.endsWith('@perrettassociates.com') || email.includes('admin')) {
                role = 'admin';
                permissions = ['read', 'write', 'admin'];
              }
              
              user = await storage.upsertUser({
                id: profile.id,
                email,
                firstName: profile.name?.givenName || '',
                lastName: profile.name?.familyName || '',
                profileImageUrl: profile.photos?.[0]?.value || '',
                authProvider: 'google',
                googleId: profile.id,
                role,
                permissions,
                isActive: true,
                lastLoginAt: new Date(),
              });
            }
          } else {
            // Update last login for existing Google user
            await storage.updateUserLastLogin(user.id);
          }

          // Log successful authentication
          await storage.logSystemEvent({
            userId: user.id,
            action: 'LOGIN_SUCCESS',
            details: {
              provider: 'google_oauth',
              email: user.email,
              loginTime: new Date().toISOString(),
              googleId: profile.id,
            },
            severity: 'info',
          });

          return done(null, user);
        } catch (error) {
          console.error('Google OAuth error:', error);
          
          // Log failed authentication
          await storage.logSystemEvent({
            userId: profile.id,
            action: 'LOGIN_FAILED',
            details: {
              provider: 'google_oauth',
              error: error.message,
              profileId: profile.id,
            },
            severity: 'error',
          });
          
          return done(error, false);
        }
      }
    )
  );

  // Google OAuth routes
  app.get("/api/auth/google", 
    passport.authenticate("google", { 
      scope: ["profile", "email"],
      prompt: "select_account" // Allow users to choose Google account
    })
  );

  app.get("/api/auth/google/callback",
    passport.authenticate("google", { 
      failureRedirect: "/api/login?error=google_auth_failed" 
    }),
    (req, res) => {
      // Successful authentication, redirect to home
      res.redirect("/");
    }
  );
}

// Middleware to check if user is authenticated via any provider
export const isAuthenticatedAny: RequestHandler = async (req: AuthenticatedRequest, res, next) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }

  // For Google OAuth users, req.user is the User object directly
  // For Replit Auth users, req.user.claims.sub contains the user ID
  let userId: string;
  let user: any;
  const passportUser = req.user as PassportUser;

  if ('id' in passportUser && passportUser.id) {
    // Direct user object (Google OAuth)
    user = passportUser;
    userId = passportUser.id;
  } else if ('claims' in passportUser && passportUser.claims?.sub) {
    // Replit Auth user
    userId = passportUser.claims.sub;
    user = await storage.getUser(userId);
  } else {
    return res.status(401).json({ message: "Invalid user session" });
  }

  if (!user || !user.isActive) {
    return res.status(401).json({ message: "User account inactive" });
  }

  req.currentUser = user;
  next();
};

export default setupGoogleAuth;