import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { JWTUtils } from '@/utils/security'
import { AnalyticsService } from '@/services/analytics'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const token = authHeader.substring(7)
    const decoded = JWTUtils.verifyToken(token)
    
    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const userId = decoded.userId

    // Get user's workspace
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { workspace: true }
    })

    if (!user || !user.workspace) {
      return res.status(404).json({ error: 'User or workspace not found' })
    }

    // Get analytics data
    const analytics = await AnalyticsService.getWorkspaceAnalytics(user.workspace.id, 30)

    res.status(200).json(analytics)
  } catch (error) {
    console.error('Error fetching analytics:', error)
    res.status(500).json({ error: 'Internal server error' })
  } finally {
    await prisma.$disconnect()
  }
} 