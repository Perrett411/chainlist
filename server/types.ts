// TypeScript type definitions for authentication system
import type { Request } from "express";
import type { User } from "../shared/schema";

// Extended User type for authentication context
export interface AuthenticatedUser extends User {
  // Additional properties for authenticated users
  claims?: {
    sub: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
    exp?: number;
    [key: string]: any;
  };
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
}

// Extended Request interface to include authentication properties
export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser | Express.User;
  currentUser?: User;
}

// Passport User type that can be either Google OAuth or Replit Auth user
export type PassportUser = AuthenticatedUser | {
  claims: {
    sub: string;
    email?: string;
    first_name?: string;
    last_name?: string;
    profile_image_url?: string;
    exp?: number;
    [key: string]: any;
  };
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
};

// Google OAuth Profile type
export interface GoogleProfile {
  id: string;
  displayName: string;
  name?: {
    familyName?: string;
    givenName?: string;
  };
  emails?: Array<{
    value: string;
    verified?: boolean;
  }>;
  photos?: Array<{
    value: string;
  }>;
  provider: string;
}

// OpenID Connect Claims interface
export interface OIDCClaims {
  sub: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
  exp?: number;
  iat?: number;
  aud?: string;
  iss?: string;
  [key: string]: any;
}

// Declare global namespace augmentation for Express
declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
    interface Request {
      currentUser?: User;
    }
  }
}