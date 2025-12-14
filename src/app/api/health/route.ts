import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Health Check Endpoint
 * Utilisé pour vérifier que l'application et la base de données fonctionnent
 * 
 * GET /api/health
 * 
 * Retourne :
 * - status: "ok" | "error"
 * - timestamp: ISO date
 * - database: "connected" | "disconnected"
 * - version: version de l'app
 * - environment: "production" | "development"
 */
export async function GET() {
  try {
    // Test de connexion à la base de données
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV || 'development',
    }, { status: 500 })
  }
}

