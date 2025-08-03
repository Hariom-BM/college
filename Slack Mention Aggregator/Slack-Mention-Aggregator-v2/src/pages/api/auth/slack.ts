import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const clientId = process.env.SLACK_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/slack/callback`
    
    if (!clientId) {
      return res.status(500).json({ error: 'Slack client ID not configured' })
    }

    const scopes = [
      'channels:read',
      'channels:history',
      'users:read',
      'users:read.email',
      'chat:write',
      'app_mentions:read',
      'team:read'
    ].join(',')

    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}`

    res.status(200).json({ url: slackAuthUrl })
  } catch (error) {
    console.error('Error generating Slack auth URL:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
} 