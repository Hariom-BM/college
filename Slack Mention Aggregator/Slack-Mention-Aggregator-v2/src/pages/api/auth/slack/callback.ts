import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import { TokenEncryption, JWTUtils } from '@/utils/security'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { code } = req.query

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Authorization code is required' })
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/slack/callback`,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.ok) {
      console.error('Slack OAuth error:', tokenData)
      return res.status(400).json({ error: 'Failed to exchange code for token' })
    }

    const { access_token, refresh_token, team, user } = tokenData

    // Encrypt the access token before storing
    const encryptedAccessToken = TokenEncryption.encrypt(access_token)
    const encryptedRefreshToken = refresh_token ? TokenEncryption.encrypt(refresh_token) : null

    // Get or create workspace
    let workspace = await prisma.workspace.findUnique({
      where: { slackId: team.id }
    })

    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          slackId: team.id,
          name: team.name,
          domain: team.domain,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          plan: 'FREE',
          settings: {},
          isActive: true
        }
      })
    } else {
      // Update existing workspace
      workspace = await prisma.workspace.update({
        where: { id: workspace.id },
        data: {
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          isActive: true,
          updatedAt: new Date()
        }
      })
    }

    // Get or create user
    let dbUser = await prisma.user.findUnique({
      where: { slackId: user.id }
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          slackId: user.id,
          email: user.email || '',
          name: user.name,
          workspaceId: workspace.id,
          role: 'USER',
          isActive: true,
          lastLogin: new Date()
        }
      })
    } else {
      // Update existing user
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          lastLogin: new Date(),
          isActive: true
        }
      })
    }

    // Generate JWT token
    const jwtToken = JWTUtils.generateToken({
      userId: dbUser.id,
      workspaceId: workspace.id,
      email: dbUser.email
    })

    // Redirect to success page with token
    const successUrl = `/auth/success?token=${encodeURIComponent(jwtToken)}&userId=${dbUser.id}&workspaceId=${workspace.id}`
    
    res.redirect(successUrl)
  } catch (error) {
    console.error('OAuth callback error:', error)
    res.redirect('/auth/error?message=Authentication failed')
  } finally {
    await prisma.$disconnect()
  }
} 