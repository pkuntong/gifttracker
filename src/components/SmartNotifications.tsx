import React, { useState, useEffect } from 'react'
import { Bell, Calendar, Gift, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { apiService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Reminder {
  id: string
  type: 'occasion' | 'gift'
  title: string
  date?: string
  description?: string
}

export const SmartNotifications: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  // Load reminders on component mount
  useEffect(() => {
    loadReminders()
  }, [])

  const loadReminders = async () => {
    setIsLoading(true)
    try {
      const response = await apiService.getReminders()
      setReminders(response.reminders || [])
    } catch (error) {
      console.error('Error loading reminders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDismiss = (reminderId: string) => {
    setReminders(prev => prev.filter(r => r.id !== reminderId))
  }

  const handleComplete = (reminderId: string) => {
    // Mark as completed (in a real app, this would update the backend)
    setReminders(prev => prev.filter(r => r.id !== reminderId))
  }

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'occasion':
        return <Calendar className="h-4 w-4 text-blue-600" />
      case 'gift':
        return <Gift className="h-4 w-4 text-purple-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getReminderBadge = (type: string) => {
    const colors = {
      occasion: 'bg-blue-100 text-blue-800',
      gift: 'bg-purple-100 text-purple-800'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  const getDaysUntil = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getUrgencyColor = (days: number) => {
    if (days <= 0) return 'text-red-600'
    if (days <= 3) return 'text-orange-600'
    if (days <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  const filteredReminders = reminders.filter(reminder => {
    if (activeTab === 'all') return true
    return reminder.type === activeTab
  })

  const upcomingOccasions = reminders.filter(r => r.type === 'occasion')
  const giftReminders = reminders.filter(r => r.type === 'gift')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Smart Notifications</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming Occasions</p>
                <p className="text-2xl font-bold">{upcomingOccasions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Gift className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Gift Reminders</p>
                <p className="text-2xl font-bold">{giftReminders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold">
                  {reminders.filter(r => r.date && getDaysUntil(r.date) <= 3).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reminders List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({reminders.length})</TabsTrigger>
              <TabsTrigger value="occasion">Occasions ({upcomingOccasions.length})</TabsTrigger>
              <TabsTrigger value="gift">Gifts ({giftReminders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <RemindersList 
                reminders={filteredReminders}
                isLoading={isLoading}
                onDismiss={handleDismiss}
                onComplete={handleComplete}
                getReminderIcon={getReminderIcon}
                getReminderBadge={getReminderBadge}
                getDaysUntil={getDaysUntil}
                getUrgencyColor={getUrgencyColor}
              />
            </TabsContent>

            <TabsContent value="occasion" className="space-y-4">
              <RemindersList 
                reminders={filteredReminders}
                isLoading={isLoading}
                onDismiss={handleDismiss}
                onComplete={handleComplete}
                getReminderIcon={getReminderIcon}
                getReminderBadge={getReminderBadge}
                getDaysUntil={getDaysUntil}
                getUrgencyColor={getUrgencyColor}
              />
            </TabsContent>

            <TabsContent value="gift" className="space-y-4">
              <RemindersList 
                reminders={filteredReminders}
                isLoading={isLoading}
                onDismiss={handleDismiss}
                onComplete={handleComplete}
                getReminderIcon={getReminderIcon}
                getReminderBadge={getReminderBadge}
                getDaysUntil={getDaysUntil}
                getUrgencyColor={getUrgencyColor}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button 
          onClick={loadReminders}
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              Loading...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Refresh Reminders
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}

export default SmartNotifications

interface RemindersListProps {
  reminders: Reminder[]
  isLoading: boolean
  onDismiss: (id: string) => void
  onComplete: (id: string) => void
  getReminderIcon: (type: string) => React.ReactNode
  getReminderBadge: (type: string) => string
  getDaysUntil: (date: string) => number
  getUrgencyColor: (days: number) => string
}

const RemindersList: React.FC<RemindersListProps> = ({
  reminders,
  isLoading,
  onDismiss,
  onComplete,
  getReminderIcon,
  getReminderBadge,
  getDaysUntil,
  getUrgencyColor
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-500">Loading reminders...</p>
      </div>
    )
  }

  if (reminders.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No reminders found</p>
        <p className="text-sm text-gray-400 mt-2">
          You're all caught up!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => {
        const daysUntil = reminder.date ? getDaysUntil(reminder.date) : null
        const urgencyColor = daysUntil !== null ? getUrgencyColor(daysUntil) : 'text-gray-600'
        
        return (
          <div
            key={reminder.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              {getReminderIcon(reminder.type)}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{reminder.title}</h4>
                  <Badge className={getReminderBadge(reminder.type)}>
                    {reminder.type}
                  </Badge>
                </div>
                {reminder.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {reminder.description}
                  </p>
                )}
                {reminder.date && (
                  <div className="flex items-center gap-1 mt-2">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span className={`text-sm ${urgencyColor}`}>
                      {daysUntil === 0 ? 'Today' : 
                       daysUntil < 0 ? `${Math.abs(daysUntil)} days ago` :
                       `${daysUntil} days away`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onComplete(reminder.id)}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss(reminder.id)}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
} 