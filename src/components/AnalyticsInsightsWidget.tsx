import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Gift,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Eye,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsInsight {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
  priority: 'high' | 'medium' | 'low';
}

interface TrendData {
  period: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

const AnalyticsInsightsWidget: React.FC = () => {
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [trends, setTrends] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Mock analytics insights
      const mockInsights: AnalyticsInsight[] = [
        {
          id: '1',
          title: 'Total Spent',
          value: '$7,787',
          change: 32,
          trend: 'up',
          description: '32% increase from last month',
          priority: 'high'
        },
        {
          id: '2',
          title: 'Gift Count',
          value: '156',
          change: 15,
          trend: 'up',
          description: '15% more gifts than last month',
          priority: 'medium'
        },
        {
          id: '3',
          title: 'Budget Used',
          value: '78.5%',
          change: -2,
          trend: 'down',
          description: '2% less than last month',
          priority: 'low'
        },
        {
          id: '4',
          title: 'Avg Gift Price',
          value: '$87.50',
          change: 8,
          trend: 'up',
          description: '8% increase in average price',
          priority: 'medium'
        }
      ];

      const mockTrends: TrendData[] = [
        { period: 'Jan', value: 12, change: 15, trend: 'up' },
        { period: 'Feb', value: 18, change: 50, trend: 'up' },
        { period: 'Mar', value: 15, change: -17, trend: 'down' },
        { period: 'Apr', value: 22, change: 47, trend: 'up' },
        { period: 'May', value: 19, change: -14, trend: 'down' },
        { period: 'Jun', value: 25, change: 32, trend: 'up' }
      ];

      setInsights(mockInsights);
      setTrends(mockTrends);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            <CardTitle>Analytics Insights</CardTitle>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to="/app/advanced-analytics">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
        <CardDescription>
          Key metrics and trends from your gift giving
        </CardDescription>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <div className="text-center py-6">
            <BarChart3 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              No analytics data yet. Start adding gifts to see insights.
            </p>
            <Button size="sm" asChild>
              <Link to="/app/gifts">
                <Gift className="w-4 h-4 mr-2" />
                Add First Gift
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-4">
              {insights.slice(0, 4).map((insight) => (
                <div key={insight.id} className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{insight.title}</span>
                    <Badge className={getPriorityColor(insight.priority)}>
                      {insight.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold">{insight.value}</span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(insight.trend)}
                      <span className="text-xs">{insight.change}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{insight.description}</p>
                </div>
              ))}
            </div>

            {/* Recent Trends */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Recent Trends</h4>
              <div className="space-y-2">
                {trends.slice(-3).map((trend) => (
                  <div key={trend.period} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm font-medium">{trend.period}</span>
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
            </div>

            {/* Budget Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Budget Utilization</span>
                <span className="text-sm font-medium">78.5%</span>
              </div>
              <Progress value={78.5} className="h-2" />
              <p className="text-xs text-muted-foreground">
                $7,787 spent of $10,000 budget
              </p>
            </div>

            <div className="pt-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/app/advanced-analytics">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Full Analytics
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsInsightsWidget; 