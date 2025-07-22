import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  LineChart,
  Calendar,
  DollarSign,
  Users,
  Gift,
  Download,
  Share2,
  Filter,
  RefreshCw,
  Eye,
  Plus,
  FileText,
  BarChart,
  Activity,
  Target,
  Award,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  MapPin,
  Star,
  Heart,
  ShoppingCart,
  Package,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';

interface AnalyticsData {
  giftStats: {
    totalGifts: number;
    completedGifts: number;
    pendingGifts: number;
    averageGiftPrice: number;
    totalSpent: number;
    budgetUtilization: number;
    giftTrends: TrendData[];
    categoryDistribution: CategoryData[];
    priceDistribution: PriceRangeData[];
  };
  peopleStats: {
    totalPeople: number;
    averageGiftsPerPerson: number;
    mostGiftedPerson: string;
    giftRecipients: RecipientData[];
    relationshipDistribution: RelationshipData[];
  };
  occasionStats: {
    totalOccasions: number;
    upcomingOccasions: number;
    averageGiftsPerOccasion: number;
    mostPopularOccasionType: string;
    occasionTrends: TrendData[];
  };
  budgetStats: {
    totalBudgets: number;
    totalBudgetAmount: number;
    totalSpent: number;
    averageBudgetUtilization: number;
    budgetTrends: TrendData[];
    spendingByCategory: CategoryData[];
  };
  insights: InsightData[];
  predictions: PredictionData[];
}

interface TrendData {
  period: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface CategoryData {
  category: string;
  count: number;
  amount: number;
  percentage: number;
}

interface PriceRangeData {
  range: string;
  count: number;
  percentage: number;
}

interface RecipientData {
  name: string;
  giftCount: number;
  totalValue: number;
  averageValue: number;
}

interface RelationshipData {
  relationship: string;
  count: number;
  percentage: number;
}

interface InsightData {
  id: string;
  type: 'spending' | 'trend' | 'pattern' | 'recommendation';
  title: string;
  description: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
}

interface PredictionData {
  id: string;
  type: 'spending' | 'occasion' | 'trend';
  title: string;
  description: string;
  predictedValue: number;
  confidence: number;
  timeframe: string;
}

const AdvancedAnalytics: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'csv' | 'json'>('pdf');
  
  const { toast } = useToast();

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, selectedCategory]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock advanced analytics data
      const mockAnalytics: AnalyticsData = {
        giftStats: {
          totalGifts: 156,
          completedGifts: 89,
          pendingGifts: 67,
          averageGiftPrice: 87.50,
          totalSpent: 7787.50,
          budgetUtilization: 78.5,
          giftTrends: [
            { period: 'Jan', value: 12, change: 15, trend: 'up' },
            { period: 'Feb', value: 18, change: 50, trend: 'up' },
            { period: 'Mar', value: 15, change: -17, trend: 'down' },
            { period: 'Apr', value: 22, change: 47, trend: 'up' },
            { period: 'May', value: 19, change: -14, trend: 'down' },
            { period: 'Jun', value: 25, change: 32, trend: 'up' }
          ],
          categoryDistribution: [
            { category: 'Electronics', count: 45, amount: 3150, percentage: 28.8 },
            { category: 'Clothing', count: 32, amount: 1280, percentage: 20.5 },
            { category: 'Books', count: 28, amount: 560, percentage: 17.9 },
            { category: 'Toys', count: 25, amount: 750, percentage: 16.0 },
            { category: 'Home & Garden', count: 26, amount: 1047.50, percentage: 16.7 }
          ],
          priceDistribution: [
            { range: '$0-25', count: 35, percentage: 22.4 },
            { range: '$26-50', count: 42, percentage: 26.9 },
            { range: '$51-100', count: 38, percentage: 24.4 },
            { range: '$101-200', count: 28, percentage: 17.9 },
            { range: '$200+', count: 13, percentage: 8.3 }
          ]
        },
        peopleStats: {
          totalPeople: 24,
          averageGiftsPerPerson: 6.5,
          mostGiftedPerson: 'Sarah Johnson',
          giftRecipients: [
            { name: 'Sarah Johnson', giftCount: 12, totalValue: 1250, averageValue: 104.17 },
            { name: 'Mike Wilson', giftCount: 10, totalValue: 890, averageValue: 89.00 },
            { name: 'Emma Davis', giftCount: 8, totalValue: 720, averageValue: 90.00 },
            { name: 'John Smith', giftCount: 7, totalValue: 650, averageValue: 92.86 },
            { name: 'Lisa Brown', giftCount: 6, totalValue: 480, averageValue: 80.00 }
          ],
          relationshipDistribution: [
            { relationship: 'Family', count: 89, percentage: 57.1 },
            { relationship: 'Friends', count: 45, percentage: 28.8 },
            { relationship: 'Colleagues', count: 15, percentage: 9.6 },
            { relationship: 'Other', count: 7, percentage: 4.5 }
          ]
        },
        occasionStats: {
          totalOccasions: 18,
          upcomingOccasions: 5,
          averageGiftsPerOccasion: 8.7,
          mostPopularOccasionType: 'Birthday',
          occasionTrends: [
            { period: 'Jan', value: 8, change: 0, trend: 'stable' },
            { period: 'Feb', value: 12, change: 50, trend: 'up' },
            { period: 'Mar', value: 10, change: -17, trend: 'down' },
            { period: 'Apr', value: 15, change: 50, trend: 'up' },
            { period: 'May', value: 13, change: -13, trend: 'down' },
            { period: 'Jun', value: 18, change: 38, trend: 'up' }
          ]
        },
        budgetStats: {
          totalBudgets: 8,
          totalBudgetAmount: 10000,
          totalSpent: 7787.50,
          averageBudgetUtilization: 78.5,
          budgetTrends: [
            { period: 'Jan', value: 1200, change: 0, trend: 'stable' },
            { period: 'Feb', value: 1800, change: 50, trend: 'up' },
            { period: 'Mar', value: 1500, change: -17, trend: 'down' },
            { period: 'Apr', value: 2200, change: 47, trend: 'up' },
            { period: 'May', value: 1900, change: -14, trend: 'down' },
            { period: 'Jun', value: 2500, change: 32, trend: 'up' }
          ],
          spendingByCategory: [
            { category: 'Electronics', count: 45, amount: 3150, percentage: 40.5 },
            { category: 'Clothing', count: 32, amount: 1280, percentage: 16.4 },
            { category: 'Books', count: 28, amount: 560, percentage: 7.2 },
            { category: 'Toys', count: 25, amount: 750, percentage: 9.6 },
            { category: 'Home & Garden', count: 26, amount: 1047.50, percentage: 13.4 }
          ]
        },
        insights: [
          {
            id: '1',
            type: 'spending',
            title: 'Spending Increase',
            description: 'Your gift spending has increased by 32% this month',
            value: '+32%',
            change: 32,
            trend: 'up',
            priority: 'high',
            actionable: true
          },
          {
            id: '2',
            type: 'trend',
            title: 'Electronics Popular',
            description: 'Electronics are your most popular gift category',
            value: '28.8%',
            change: 5,
            trend: 'up',
            priority: 'medium',
            actionable: false
          },
          {
            id: '3',
            type: 'pattern',
            title: 'Budget Efficiency',
            description: 'You\'re staying within 78.5% of your budget',
            value: '78.5%',
            change: -2,
            trend: 'down',
            priority: 'low',
            actionable: true
          },
          {
            id: '4',
            type: 'recommendation',
            title: 'Diversify Categories',
            description: 'Consider diversifying your gift categories',
            value: '5 categories',
            change: 0,
            trend: 'stable',
            priority: 'medium',
            actionable: true
          }
        ],
        predictions: [
          {
            id: '1',
            type: 'spending',
            title: 'July Spending Prediction',
            description: 'Expected to spend $2,800 on gifts in July',
            predictedValue: 2800,
            confidence: 85,
            timeframe: 'Next 30 days'
          },
          {
            id: '2',
            type: 'occasion',
            title: 'Birthday Season',
            description: '5 birthdays coming up in the next 60 days',
            predictedValue: 5,
            confidence: 92,
            timeframe: 'Next 60 days'
          },
          {
            id: '3',
            type: 'trend',
            title: 'Category Growth',
            description: 'Electronics category expected to grow by 15%',
            predictedValue: 15,
            confidence: 78,
            timeframe: 'Next 90 days'
          }
        ]
      };

      setAnalytics(mockAnalytics);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'spending': return <DollarSign className="w-4 h-4" />;
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'pattern': return <BarChart3 className="w-4 h-4" />;
      case 'recommendation': return <Target className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const handleExport = async () => {
    try {
      toast({
        title: "Exporting",
        description: `Exporting analytics data as ${exportFormat.toUpperCase()}...`,
      });
      
      // Mock export
      setTimeout(() => {
        toast({
          title: "Success",
          description: `Analytics exported as ${exportFormat.toUpperCase()}`,
        });
        setIsExportDialogOpen(false);
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export analytics",
        variant: "destructive",
      });
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

  if (!analytics) {
    return (
      <div className="p-6">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
          <p className="text-muted-foreground">Start adding gifts to see your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Advanced Analytics</h1>
            <p className="text-muted-foreground">Comprehensive insights and data visualization</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={() => setIsExportDialogOpen(true)}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gifts</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.giftStats.totalGifts}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(analytics.giftStats.giftTrends[analytics.giftStats.giftTrends.length - 1].trend)}
              <span>{analytics.giftStats.giftTrends[analytics.giftStats.giftTrends.length - 1].change}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.giftStats.totalSpent.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              {getTrendIcon(analytics.budgetStats.budgetTrends[analytics.budgetStats.budgetTrends.length - 1].trend)}
              <span>{analytics.budgetStats.budgetTrends[analytics.budgetStats.budgetTrends.length - 1].change}% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Gift Price</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analytics.giftStats.averageGiftPrice}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>Across {analytics.giftStats.totalGifts} gifts</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.giftStats.budgetUtilization}%</div>
            <Progress value={analytics.giftStats.budgetUtilization} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Gift Categories</CardTitle>
                <CardDescription>Distribution of gifts by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.giftStats.categoryDistribution.map((category) => (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium">{category.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{category.count} gifts</span>
                        <Badge variant="secondary">{category.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Price Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Price Distribution</CardTitle>
                <CardDescription>Gift prices across different ranges</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.giftStats.priceDistribution.map((range) => (
                    <div key={range.range} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{range.range}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{range.count} gifts</span>
                        <Badge variant="secondary">{range.percentage}%</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Recipients */}
          <Card>
            <CardHeader>
              <CardTitle>Top Gift Recipients</CardTitle>
              <CardDescription>People who received the most gifts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.peopleStats.giftRecipients.map((recipient, index) => (
                  <div key={recipient.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{recipient.name}</p>
                        <p className="text-sm text-muted-foreground">{recipient.giftCount} gifts</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${recipient.totalValue}</p>
                      <p className="text-sm text-muted-foreground">Avg: ${recipient.averageValue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gift Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Gift Trends</CardTitle>
                <CardDescription>Monthly gift count trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.giftStats.giftTrends.map((trend) => (
                    <div key={trend.period} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-medium">{trend.period}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{trend.value} gifts</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(trend.trend)}
                          <span className="text-xs">{trend.change}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Spending Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>Monthly spending patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.budgetStats.budgetTrends.map((trend) => (
                    <div key={trend.period} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-medium">{trend.period}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">${trend.value}</span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(trend.trend)}
                          <span className="text-xs">{trend.change}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.insights.map((insight) => (
              <Card key={insight.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.type)}
                      <CardTitle className="text-lg">{insight.title}</CardTitle>
                    </div>
                    <Badge className={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>
                  <CardDescription>{insight.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">{insight.value}</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(insight.trend)}
                        <span className="text-sm">{insight.change}%</span>
                      </div>
                    </div>
                    {insight.actionable && (
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analytics.predictions.map((prediction) => (
              <Card key={prediction.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{prediction.title}</CardTitle>
                    <Badge variant="secondary">{prediction.confidence}% confidence</Badge>
                  </div>
                  <CardDescription>{prediction.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Predicted Value</span>
                      <span className="text-2xl font-bold">
                        {prediction.type === 'spending' ? '$' : ''}{prediction.predictedValue}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Timeframe</span>
                      <span className="text-sm text-muted-foreground">{prediction.timeframe}</span>
                    </div>
                    <Progress value={prediction.confidence} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Confidence level: {prediction.confidence}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Analytics</DialogTitle>
            <DialogDescription>
              Export your analytics data in various formats
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={(value: 'pdf' | 'csv' | 'json') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdvancedAnalytics; 