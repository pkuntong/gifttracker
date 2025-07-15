import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gift, 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface MobileDashboardProps {
  onNavigate: (page: string) => void;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ onNavigate }) => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const quickActions = [
    {
      id: 'add-gift',
      title: t('dashboard.addGift'),
      icon: Gift,
      color: 'bg-blue-500',
      action: () => onNavigate('gifts')
    },
    {
      id: 'add-person',
      title: t('dashboard.addPerson'),
      icon: Users,
      color: 'bg-green-500',
      action: () => onNavigate('people')
    },
    {
      id: 'add-occasion',
      title: t('dashboard.addOccasion'),
      icon: Calendar,
      color: 'bg-purple-500',
      action: () => onNavigate('occasions')
    },
    {
      id: 'view-analytics',
      title: t('dashboard.viewAnalytics'),
      icon: TrendingUp,
      color: 'bg-orange-500',
      action: () => onNavigate('analytics')
    }
  ];

  const upcomingGifts = [
    { id: 1, name: 'Mom', occasion: 'Birthday', date: '2024-02-15', progress: 75 },
    { id: 2, name: 'Dad', occasion: 'Father\'s Day', date: '2024-06-16', progress: 30 },
    { id: 3, name: 'Sister', occasion: 'Christmas', date: '2024-12-25', progress: 90 }
  ];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentSlide < 2) {
      setCurrentSlide(currentSlide + 1);
    } else if (direction === 'right' && currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="space-y-6 p-4 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t('dashboard.welcome')}</h1>
          <p className="text-gray-600">{t('dashboard.subtitle')}</p>
        </div>
        <Button size="sm" onClick={() => onNavigate('gifts')}>
          <Plus className="h-4 w-4 mr-2" />
          {t('dashboard.addGift')}
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            {t('dashboard.quickActions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2"
                  onClick={action.action}
                >
                  <div className={`p-2 rounded-full ${action.color}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-xs text-center">{action.title}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Swipeable Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('dashboard.stats')}</span>
            <div className="flex gap-1">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-hidden">
            <div 
              className="flex transition-transform duration-300"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {/* Slide 1: Overview */}
              <div className="w-full flex-shrink-0">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-gray-600">{t('dashboard.totalGifts')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-gray-600">{t('dashboard.completed')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">4</div>
                    <div className="text-sm text-gray-600">{t('dashboard.pending')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">$1,250</div>
                    <div className="text-sm text-gray-600">{t('dashboard.totalSpent')}</div>
                  </div>
                </div>
              </div>

              {/* Slide 2: Budget */}
              <div className="w-full flex-shrink-0">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>{t('dashboard.budgetUsed')}</span>
                      <span>75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-green-600">$1,250</div>
                      <div className="text-xs text-gray-600">{t('dashboard.spent')}</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">$1,650</div>
                      <div className="text-xs text-gray-600">{t('dashboard.budget')}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slide 3: Timeline */}
              <div className="w-full flex-shrink-0">
                <div className="space-y-3">
                  <div className="text-sm font-medium">{t('dashboard.nextOccasions')}</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">Mom's Birthday</div>
                        <div className="text-xs text-gray-600">Feb 15, 2024</div>
                      </div>
                      <Badge variant="secondary">3 days</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <div className="font-medium">Dad's Day</div>
                        <div className="text-xs text-gray-600">Jun 16, 2024</div>
                      </div>
                      <Badge variant="outline">4 months</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Gifts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('dashboard.upcomingGifts')}</span>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('gifts')}>
              {t('dashboard.viewAll')}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingGifts.map((gift) => (
              <div key={gift.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{gift.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {gift.occasion}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">{gift.date}</div>
                  <div className="flex items-center gap-2">
                    <Progress value={gift.progress} className="flex-1 h-2" />
                    <span className="text-xs text-gray-500">{gift.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Swipe Instructions */}
      <div className="text-center text-sm text-gray-500 flex items-center justify-center gap-2">
        <ChevronLeft className="h-4 w-4" />
        {t('dashboard.swipeToExplore')}
        <ChevronRight className="h-4 w-4" />
      </div>
    </div>
  );
};

export default MobileDashboard; 