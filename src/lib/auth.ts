import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcrypt';
import { loginSchema } from './validations';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 jours
  },
  pages: {
    signIn: '/login',
    signOut: '/logout',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] Authorize attempt for:', credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        // Récupérer l'utilisateur
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          console.log('❌ [AUTH] User not found or no password');
          throw new Error('Email ou mot de passe incorrect');
        }

        // Vérifier le mot de passe
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          console.log('❌ [AUTH] Invalid password');
          throw new Error('Email ou mot de passe incorrect');
        }

        console.log('✅ [AUTH] Login successful for user:', user.id);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('🎫 [AUTH] JWT Callback - Adding user to token:', user.id);
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log('📝 [AUTH] Session Callback - Token ID:', token.id);
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  debug: true, // Enable debug messages in console
  secret: process.env.NEXTAUTH_SECRET || "secret-de-fallback-pour-dev-uniquement",
};

/**
 * Hash un mot de passe avec bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Vérifie un mot de passe
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
