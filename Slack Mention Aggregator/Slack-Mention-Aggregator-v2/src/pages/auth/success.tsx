import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { CheckCircle, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AuthSuccess() {
  const router = useRouter()
  const { token, userId, workspaceId } = router.query

  useEffect(() => {
    if (token && userId && workspaceId) {
      // Store authentication data securely
      localStorage.setItem('authToken', token as string)
      localStorage.setItem('userId', userId as string)
      localStorage.setItem('workspaceId', workspaceId as string)
      
      toast.success('Successfully authenticated!')
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/')
      }, 2000)
    }
  }, [token, userId, workspaceId, router])

  return (
    <>
      <Head>
        <title>Authentication Success - Slack Mention Aggregator v2</title>
        <meta name="description" content="Authentication successful" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-success-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Authentication Successful!
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your Slack workspace has been connected successfully.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card text-center">
            <MessageSquare className="h-16 w-16 text-primary-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Welcome to Slack Mention Aggregator v2
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              You're being redirected to your dashboard where you can start tracking and analyzing your Slack mentions.
            </p>
            <div className="animate-pulse">
              <div className="flex justify-center space-x-2">
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">What you can do now:</h4>
              <ul className="space-y-1 text-xs">
                <li>• View all your Slack mentions in one place</li>
                <li>• Get analytics and insights</li>
                <li>• Set up notifications for urgent mentions</li>
                <li>• Track response times and performance</li>
                <li>• Manage multiple channels and workspaces</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 