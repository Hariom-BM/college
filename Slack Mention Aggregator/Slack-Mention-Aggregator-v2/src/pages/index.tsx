import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { 
  Bell, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Plus
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Mention {
  id: string
  channelName: string
  senderName: string
  message: string
  timestamp: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE'
  category: string
  isResponded: boolean
  responseTime?: number
}

interface Analytics {
  totalMentions: number
  urgentMentions: number
  avgResponseTime: number
  topChannels: Array<{ name: string; count: number }>
  topSenders: Array<{ name: string; count: number }>
  sentimentDistribution: Record<string, number>
  dailyTrends: Array<{ date: string; count: number }>
}

export default function Dashboard() {
  const router = useRouter()
  const [mentions, setMentions] = useState<Mention[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'mentions' | 'analytics' | 'settings'>('mentions')

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/auth/login')
      return
    }

    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch mentions
      const mentionsResponse = await fetch('/api/mentions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (mentionsResponse.ok) {
        const mentionsData = await mentionsResponse.json()
        setMentions(mentionsData)
      }

      // Fetch analytics
      const analyticsResponse = await fetch('/api/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('workspaceId')
    router.push('/auth/login')
    toast.success('Logged out successfully')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'badge-danger'
      case 'HIGH': return 'badge-warning'
      case 'MEDIUM': return 'badge-info'
      case 'LOW': return 'badge-success'
      default: return 'badge-info'
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE': return 'badge-success'
      case 'NEGATIVE': return 'badge-danger'
      case 'NEUTRAL': return 'badge-info'
      default: return 'badge-info'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Slack Mention Aggregator v2 - Dashboard</title>
        <meta name="description" content="Enhanced Slack Mention Aggregator with Analytics and Security" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-primary-600" />
                <h1 className="ml-3 text-xl font-semibold text-gray-900">
                  Slack Mention Aggregator v2
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button className="btn-secondary">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </button>
                <button onClick={handleLogout} className="btn-danger">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('mentions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'mentions'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <MessageSquare className="h-4 w-4 inline mr-2" />
                Mentions
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BarChart3 className="h-4 w-4 inline mr-2" />
                Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'mentions' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <MessageSquare className="h-8 w-8 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Mentions</p>
                      <p className="text-2xl font-semibold text-gray-900">{mentions.length}</p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-8 w-8 text-danger-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Urgent</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {mentions.filter(m => m.priority === 'URGENT').length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Clock className="h-8 w-8 text-warning-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Avg Response</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {analytics?.avgResponseTime || 0}m
                      </p>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-success-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Active Users</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {analytics?.topSenders?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mentions List */}
              <div className="card">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Mentions</h2>
                  <button className="btn-primary">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Mention
                  </button>
                </div>

                <div className="space-y-4">
                  {mentions.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No mentions found</p>
                    </div>
                  ) : (
                    mentions.map((mention) => (
                      <div key={mention.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="badge badge-info">{mention.channelName}</span>
                              <span className={`badge ${getPriorityColor(mention.priority)}`}>
                                {mention.priority}
                              </span>
                              <span className={`badge ${getSentimentColor(mention.sentiment)}`}>
                                {mention.sentiment}
                              </span>
                              {mention.isResponded && (
                                <span className="badge badge-success">Responded</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>{mention.senderName}</strong> mentioned you
                            </p>
                            <p className="text-gray-900">{mention.message}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(mention.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button className="btn-secondary text-sm">Reply</button>
                            <button className="btn-primary text-sm">View</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && analytics && (
            <div className="space-y-6">
              <div className="card">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Top Channels</h3>
                    <div className="space-y-2">
                      {analytics.topChannels?.map((channel, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{channel.name}</span>
                          <span className="text-sm font-medium text-gray-900">{channel.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Top Senders</h3>
                    <div className="space-y-2">
                      {analytics.topSenders?.map((sender, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{sender.name}</span>
                          <span className="text-sm font-medium text-gray-900">{sender.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  )
} 