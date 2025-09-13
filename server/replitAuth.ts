// Replit Auth implementation for Perrett & Associates platform
// Referenced from javascript_log_in_with_replit blueprint

import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/build/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";
import setupGoogleAuth from "./googleAuth";
import type { OIDCClaims } from "./types";

if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}

const getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID!
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  const claims = tokens.claims() as OIDCClaims;
  user.claims = claims;
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = claims?.exp;
  
  // Log successful authentication
  if (claims?.sub) {
    storage.logSystemEvent({
      userId: claims.sub,
      action: 'LOGIN_SUCCESS',
      details: {
        provider: 'replit_auth',
        email: claims.email || '',
        loginTime: new Date().toISOString(),
      },
      severity: 'info',
    });
  }
}

async function upsertUser(claims: OIDCClaims) {
  // Determine user role based on email domain or other criteria
  let role = 'user';
  let permissions = ['read'];
  
  // Admin users for Perrett & Associates
  if (claims.email?.endsWith('@perrettassociates.com') || 
      claims.email?.includes('admin')) {
    role = 'admin';
    permissions = ['read', 'write', 'admin'];
  }
  
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
    authProvider: 'replit',
    replitId: claims["sub"],
    role,
    permissions,
    isActive: true,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Setup Google OAuth alongside Replit Auth
  setupGoogleAuth(app);

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user: any = {};
    updateUserSession(user, tokens);
    const claims = tokens.claims();
    if (claims) {
      await upsertUser(claims as OIDCClaims);
    }
    verified(null, user);
  };

  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    const userId = (req.user as any)?.claims?.sub;
    
    // Log logout event
    if (userId) {
      storage.logSystemEvent({
        userId,
        action: 'LOGOUT',
        details: { logoutTime: new Date().toISOString() },
        severity: 'info',
      });
    }
    
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    // Update last login time
    if (user.claims?.sub) {
      await storage.updateUserLastLogin(user.claims.sub);
    }
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    // Log failed token refresh
    storage.logSystemEvent({
      userId: user.claims?.sub,
      action: 'TOKEN_REFRESH_FAILED',
      details: { error: error.message },
      severity: 'warning',
    });
    
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// Role-based access control middleware
export const requireRole = (requiredRole: string) => {
  return async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.user.claims.sub);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "User account inactive" });
    }

    if (user.role !== requiredRole && user.role !== 'admin') {
      // Log unauthorized access attempt
      await storage.logSystemEvent({
        userId: user.id,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        details: {
          requiredRole,
          userRole: user.role,
          endpoint: req.path,
        },
        severity: 'warning',
      });
      
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    req.currentUser = user;
    next();
  };
};

// Permission-based access control middleware
export const requirePermission = (requiredPermission: string) => {
  return async (req: any, res: any, next: any) => {
    if (!req.isAuthenticated() || !req.user?.claims?.sub) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await storage.getUser(req.user.claims.sub);
    if (!user || !user.isActive || !user.permissions.includes(requiredPermission)) {
      // Log unauthorized access attempt
      await storage.logSystemEvent({
        userId: user?.id,
        action: 'INSUFFICIENT_PERMISSIONS',
        details: {
          requiredPermission,
          userPermissions: user?.permissions || [],
          endpoint: req.path,
        },
        severity: 'warning',
      });
      
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    req.currentUser = user;
    next();
  };
};