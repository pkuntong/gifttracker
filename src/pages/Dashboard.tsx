import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Gift, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Plus,
  ArrowRight,
  Heart,
  Bell,
  BarChart3,
  Lightbulb,
  Sparkles,
  Target
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';
import MobileDashboard from '@/components/MobileDashboard';
import RecommendationWidget from '@/components/RecommendationWidget';
import TrackingWidget from '@/components/TrackingWidget';
import SocialWidget from '@/components/SocialWidget';
import AnalyticsInsightsWidget from '@/components/AnalyticsInsightsWidget';
import SearchWidget from '@/components/SearchWidget';
import NotificationWidget from '@/components/NotificationWidget';
import DataManagementWidget from '@/components/DataManagementWidget';
import BudgetManagementWidget from '@/components/BudgetManagementWidget';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalGifts: 0,
    totalPeople: 0,
    totalOccasions: 0,
    totalBudget: 0,
    spentBudget: 0,
    upcomingGifts: 0,
    recentActivity: [] as Array<{ title: string; time: string }>,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { isMobile } = useMobile();
  
  // Safely get navigate hook with error handling
  let navigate: ReturnType<typeof useNavigate>;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.error('Navigation context error:', error);
    navigate = () => {}; // Fallback no-op function
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [giftsResponse, peopleResponse, occasionsResponse, budgetsResponse] = await Promise.all([
        apiService.getGifts(),
        apiService.getPeople(),
        apiService.getOccasions(),
        apiService.getBudgets(),
      ]);

      // Extract arrays from responses with comprehensive error handling
      const gifts = Array.isArray(giftsResponse) ? giftsResponse : 
                   Array.isArray(giftsResponse?.data) ? giftsResponse.data : [];
      const people = Array.isArray(peopleResponse) ? peopleResponse : 
                    Array.isArray(peopleResponse?.data) ? peopleResponse.data : [];
      const occasions = Array.isArray(occasionsResponse) ? occasionsResponse : 
                       Array.isArray(occasionsResponse?.data) ? occasionsResponse.data : [];
      const budgets = Array.isArray(budgetsResponse) ? budgetsResponse : 
                     Array.isArray(budgetsResponse?.data) ? budgetsResponse.data : [];
      
      console.log('Dashboard data loaded:', { gifts, people, occasions, budgets });

      // Safely calculate budget totals with fallbacks
      const totalBudget = Array.isArray(budgets) ? budgets.reduce((sum, budget) => sum + (budget.amount || 0), 0) : 0;
      const spentBudget = Array.isArray(budgets) ? budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0) : 0;
      const upcomingGifts = Array.isArray(gifts) ? gifts.filter(gift => 
        gift.occasionId && new Date() > new Date()
      ).length : 0;

      const recentActivity = [
        { title: 'Added new gift for John', time: '2 hours ago' },
        { title: 'Updated budget for Christmas', time: '1 day ago' },
        { title: 'Created birthday occasion', time: '2 days ago' },
      ];

      setStats({
        totalGifts: Array.isArray(gifts) ? gifts.length : 0,
        totalPeople: Array.isArray(people) ? people.length : 0,
        totalOccasions: Array.isArray(occasions) ? occasions.length : 0,
        totalBudget,
        spentBudget,
        upcomingGifts,
        recentActivity,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Show mobile dashboard for mobile devices
  if (isMobile) {
    return <MobileDashboard onNavigate={(page) => {
      // This will be handled by the Layout component
      window.location.href = `/${page}`;
    }} />;
  }

  const budgetProgress = stats.totalBudget > 0 ? (stats.spentBudget / stats.totalBudget) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-left">Welcome back!</h1>
            <p className="text-muted-foreground text-left">
              {stats.upcomingGifts > 0 
                ? `You have ${stats.upcomingGifts} upcoming gifts to plan`
                : "Ready to plan some thoughtful gifts?"
              }
            </p>
          </div>
          {stats.upcomingGifts > 0 && (
            <Badge variant="destructive" className="px-3 py-1">
              {stats.upcomingGifts} urgent
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">

      {/* Priority Actions - Only show if user needs to take action */}
      {stats.upcomingGifts > 0 && (
        <Card className="border-l-4 border-l-red-500 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              You have {stats.upcomingGifts} gifts to plan for upcoming occasions. 
              Don't wait until the last minute!
            </p>
            <div className="flex gap-2">
              <Button asChild>
                <Link to="/app/gifts">Plan Gifts Now</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/app/occasions">View Occasions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simplified Stats Overview - Only most important metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/app/gifts')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.totalGifts}</div>
                <p className="text-sm text-muted-foreground">Gifts Tracked</p>
              </div>
              <Gift className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/app/people')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.totalPeople}</div>
                <p className="text-sm text-muted-foreground">People</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/app/budgets')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">${stats.totalBudget}</div>
                <p className="text-sm text-muted-foreground">Budget Set</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/app/occasions')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{stats.totalOccasions}</div>
                <p className="text-sm text-muted-foreground">Occasions</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
            <CardDescription>
              Track your gift spending and budget allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Budget</span>
                <span className="text-sm font-medium">${stats.totalBudget}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Spent</span>
                <span className="text-sm font-medium">${stats.spentBudget}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Remaining</span>
                <span className="text-sm font-medium">${stats.totalBudget - stats.spentBudget}</span>
              </div>
              <Progress value={budgetProgress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {budgetProgress.toFixed(1)}% of budget used
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common actions to manage your gifts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button asChild variant="outline" className="h-20">
                <Link to="/app/gifts">
                  <div className="flex flex-col items-center gap-2">
                    <Gift className="h-6 w-6" />
                    <span className="text-sm">Add Gift</span>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20">
                <Link to="/app/people">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Add Person</span>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20">
                <Link to="/app/occasions">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Add Occasion</span>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20">
                <Link to="/app/budgets">
                  <div className="flex flex-col items-center gap-2">
                    <DollarSign className="h-6 w-6" />
                    <span className="text-sm">Set Budget</span>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20">
                <Link to="/app/recommendations">
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="h-6 w-6" />
                    <span className="text-sm">Get Recommendations</span>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Recommendations */}
      <RecommendationWidget maxItems={3} />

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SearchWidget />
        <NotificationWidget />
        <TrackingWidget />
        <DataManagementWidget />
        <BudgetManagementWidget />
      </div>

      {/* Social Activity */}
      <SocialWidget />

      {/* Analytics Insights */}
      <AnalyticsInsightsWidget />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest gift tracking activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-sm text-muted-foreground">{activity.time}</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Gift, label: 'Gifts', path: '/app/gifts', badge: stats.totalGifts },
          { icon: Users, label: 'People', path: '/app/people', badge: stats.totalPeople },
          { icon: Calendar, label: 'Occasions', path: '/app/occasions', badge: stats.totalOccasions },
          { icon: DollarSign, label: 'Budgets', path: '/app/budgets' },
          { icon: Heart, label: 'Families', path: '/app/families' },
          { icon: Bell, label: 'Notifications', path: '/app/notifications' },
          { icon: BarChart3, label: 'Analytics', path: '/app/analytics' },
          { icon: Lightbulb, label: 'Gift Ideas', path: '/app/gift-ideas' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.path} className="hover:shadow-md transition-shadow">
              <Link to={item.path}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    {item.badge && (
                      <Badge variant="secondary">{item.badge}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-semibold">{item.label}</div>
                  <p className="text-sm text-muted-foreground">
                    Manage your {item.label.toLowerCase()}
                  </p>
                </CardContent>
              </Link>
            </Card>
          );
        })}
      </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 