/**
 * Next.js 14 App Router Entry Point
 * Configure Next.js for optimal performance and SEO
 */

import NextAuth, { NextAuthConfig } from 'next-auth';

const authConfig: NextAuthConfig = {
  providers: [
    // Email Authentication Provider
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        // Validate authentication
        const user = await validateUser(
          credentials.email,
          credentials.password,
        );

        if (!user) {
          throw new Error('User not found');
        }

        return user;
      },
    },

    // OAuth Providers (Google, Microsoft, etc.)
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.username) {
          throw new Error('Invalid credentials');
        }

        // User authentication logic
        const user = await AuthService.authenticate(
          credentials.email,
          credentials.username,
        );

        if (user) {
          return {
            id: user.id,
            email: user.email,
            role: user.role,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
          };
        }

        return null;
      },
    }),

    // Email-based Authentication (Magic Links)
    CredentialsProvider({
      name: 'Magic Link',
      credentials: {
        email: { label: 'Email Address', type: 'email' },
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Email is required');
        }

        // Generate and send magic link
        const token = await generateMagicLinkToken(
          credentials.email,
          expiration: 'email-expiration',
        );

        if (token) {
          return {
            id: 'magic-link',
            email: credentials.email,
            token: token.value,
            expiresAt: token.expiresAt,
          };
        }

        return null;
      },
    }),
  ],

  pages: {
    signIn: '/auth/sign-in',
    signUp: '/auth/sign-up',
    verifyRequest: '/auth/verify-request',
    error: '/auth/error',
  },

  callbacks: {
    async jwt({ token, trigger, session }) {
      if (trigger === 'update') {
        token.role = session.user?.role;
        token.accessToken = session.accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.role = token.role as UserRole;
      session.user.accessToken = token.accessToken as string;

      return session;
    },

    async signIn({ user, account, profile }) {
      // Check user registration status
      if (!user.email) {
        return false;
      }

      // Validate user exists and is active
      const isUserActive = await UserService.isEligibleForLogin(
        user.id,
        user.email,
      );

      if (!isUserActive) {
        return '/auth/error?error=account_inactive';
      }

      return true;
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      // Track sign-in events
      logger.info('User signed in', {
        user: user.id,
        accountType: account?.type,
        isNewUser: isNewUser,
      });
    },

    async signUp({ user, account, isNewUser }) {
      // Track user registration
      logger.info('User registered', {
        user: user.id,
        isNewUser: isNewUser,
      });
    },

    async signOut({ token }) {
      // Handle session termination
      logger.info('User signed out', {
        user: token.id,
      });
    },
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },

  // Security Configuration
  security: {
    csrfToken: true,
    sessionToken: true,
    enableHttpSecurity: true,
    enableContentSecurityPolicy: true,
  },
};

// Authentication Service
const AuthService = {
  // User Authentication
  async authenticate(email: string, password: string) {
    try {
      const response = await authenticateUser({
        email,
        password,
        source: 'WEB_APPLICATION',
      });

      if (response.success) {
        const { user, tokens } = response.data;
        return {
          id: user.id,
          email: user.email,
          role: user.role,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        };
      }

      return null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  },

  // Session Management
  async refreshSession(token: string) {
    try {
      const response = await refreshUserSession(token);

      if (response.success) {
        return {
          user: response.data.user,
          tokens: response.data.tokens,
          lastActivity: response.data.lastActivity,
          expiry: response.data.expiry,
        };
      }

      return null;
    } catch (error) {
      console.error('Session refresh error:', error);
      return null;
    }
  },
};

export default NextAuth(authConfig);

// Types
export type { NextAuthRequest, Session, User } from 'next-auth';

import { NextRequest, NextResponse } from 'next/server';

// Middleware Configuration
export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const isAuthPage = nextUrl.pathname.startsWith('/auth');

  // Fetch authentication token
  const token = request.cookies.get('auth_token')?.value;
  const { user, isAuthenticated } = AuthController.validate(token);

  // Public Routes
  const publicRoutes = ['/auth', '/family', '/patients'];
  const isPublicRoute = publicRoutes.some(route =>
    nextUrl.pathname.startsWith(route),
  );

  // Authentication Logic
  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL('/home', nextUrl));
  }

  // Route Protection
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL('/auth/login', nextUrl);
    loginUrl.searchParams.set('callbackUrl', nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  // Access Control for Roles
  if (isAuthenticated && user?.role === 'ADMIN') {
    if (!nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin/dashboard', nextUrl));
    }
  }

  // Handle User Session
  if (isAuthenticated) {
    // Update user activity
    await trackUserActivity(token!, 'PAGE_ACCESS', {
      route: nextUrl.pathname,
      timestamp: Date.now(),
    });
  }

  // API Routes Handling
  if (nextUrl.pathname.startsWith('/api')) {
    return handleApiRoutes(request);
  }

  return NextResponse.next();
}

// Middleware Configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except for the next.js statically served folders
     * - /_static
     * - /api
     * - /auth/*
     * - /family/*
     * - /patients/*
     * - /admin/*
     */
    '/((?!_static|api|auth|family|patients|admin).*)',
  ],
};

// Helper Functions
async function handleApiRoutes(request: NextRequest): Promise<NextResponse> {
  const { nextUrl } = request;
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  if (isApiRoute) {
    try {
      const response = await fetchApiRoutes(nextUrl, request);
      return response;
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          message: 'API route processing failed',
          error: error.message,
        },
        { status: 500 },
      );
    }
  }

  return NextResponse.next();
}

async function trackUserActivity(
  token: string,
  activityType: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  // Track user activity in real-time
  await AnalyticsService.trackActivity({
    type: activityType,
    timestamp: Date.now(),
    metadata,
  });

  // Update user session metrics
  await SessionService.updateSessionMetrics({
    activityCount: 1,
    lastActivity: new Date(),
  });

  logger.info('User activity tracked', {
    activityType,
    token,
    metadata,
  });
}