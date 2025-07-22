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
import { Link } from 'react-router-dom';
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

      // Extract arrays from responses (handle both direct arrays and objects with data property)
      const gifts = Array.isArray(giftsResponse) ? giftsResponse : (giftsResponse?.data || []);
      const people = Array.isArray(peopleResponse) ? peopleResponse : (peopleResponse?.data || []);
      const occasions = Array.isArray(occasionsResponse) ? occasionsResponse : (occasionsResponse?.data || []);
      const budgets = Array.isArray(budgetsResponse) ? budgetsResponse : (budgetsResponse?.data || []);

      const totalBudget = budgets.reduce((sum, budget) => sum + (budget.amount || 0), 0);
      const spentBudget = budgets.reduce((sum, budget) => sum + (budget.spent || 0), 0);
      const upcomingGifts = gifts.filter(gift => 
        gift.occasionId && new Date() > new Date()
      ).length;

      const recentActivity = [
        { title: 'Added new gift for John', time: '2 hours ago' },
        { title: 'Updated budget for Christmas', time: '1 day ago' },
        { title: 'Created birthday occasion', time: '2 days ago' },
      ];

      setStats({
        totalGifts: gifts.length,
        totalPeople: people.length,
        totalOccasions: occasions.length,
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

  const budgetProgress = (stats.spentBudget / stats.totalBudget) * 100;

  return (
    <div className="min-h-screen bg-background">
      
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h1 className="text-3xl font-bold text-left">Dashboard</h1>
            <p className="text-muted-foreground text-left">Welcome to your gift tracking dashboard</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gifts</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGifts}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">People</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPeople}</div>
            <p className="text-xs text-muted-foreground">
              +1 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Occasions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOccasions}</div>
            <p className="text-xs text-muted-foreground">
              +3 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Gifts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingGifts}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
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
                <Link to="/gifts">
                  <div className="flex flex-col items-center gap-2">
                    <Gift className="h-6 w-6" />
                    <span className="text-sm">Add Gift</span>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20">
                <Link to="/people">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Add Person</span>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20">
                <Link to="/occasions">
                  <div className="flex flex-col items-center gap-2">
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Add Occasion</span>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20">
                <Link to="/budgets">
                  <div className="flex flex-col items-center gap-2">
                    <DollarSign className="h-6 w-6" />
                    <span className="text-sm">Set Budget</span>
                  </div>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-20">
                <Link to="/recommendations">
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
          { icon: Gift, label: 'Gifts', path: '/gifts', badge: stats.totalGifts },
          { icon: Users, label: 'People', path: '/people', badge: stats.totalPeople },
          { icon: Calendar, label: 'Occasions', path: '/occasions', badge: stats.totalOccasions },
          { icon: DollarSign, label: 'Budgets', path: '/budgets' },
          { icon: Heart, label: 'Families', path: '/families' },
          { icon: Bell, label: 'Notifications', path: '/notifications' },
          { icon: BarChart3, label: 'Analytics', path: '/analytics' },
          { icon: Lightbulb, label: 'Gift Ideas', path: '/gift-ideas' },
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