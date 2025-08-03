import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { MessageSquare, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSlackLogin = async () => {
    setLoading(true)
    try {
      // Redirect to Slack OAuth
      const response = await fetch('/api/auth/slack')
      if (response.ok) {
        const data = await response.json()
        window.location.href = data.url
      } else {
        toast.error('Failed to initiate Slack login')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Login - Slack Mention Aggregator v2</title>
        <meta name="description" content="Login to Slack Mention Aggregator v2" />
      </Head>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <MessageSquare className="h-12 w-12 text-primary-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Slack Mention Aggregator v2
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enhanced analytics and security for your Slack mentions
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="card">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Sign in to your account
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Connect your Slack workspace to start tracking and analyzing mentions with enhanced security and analytics.
                </p>
              </div>

              <div>
                <button
                  onClick={handleSlackLogin}
                  disabled={loading}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <MessageSquare className="h-5 w-5 mr-2" />
                      Continue with Slack
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </button>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  By signing in, you agree to our terms of service and privacy policy.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-600">
              <h4 className="font-medium mb-2">What's new in v2:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Enhanced security with JWT and encryption</li>
                <li>• Advanced analytics and insights</li>
                <li>• Real-time notifications</li>
                <li>• Better UI/UX with modern design</li>
                <li>• Multi-workspace support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 