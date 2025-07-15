import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Target,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  currency: string;
  status: 'on_track' | 'over_budget' | 'under_budget' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface FinancialInsight {
  id: string;
  type: 'savings' | 'spending' | 'prediction' | 'optimization';
  title: string;
  description: string;
  value: number;
  currency: string;
  change: number;
  changeType: 'increase' | 'decrease';
  actionable: boolean;
  action?: string;
  priority: 'low' | 'medium' | 'high';
}

const BudgetManagementWidget: React.FC = () => {
  const { t } = useTranslation();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data
  const mockBudgets: Budget[] = [
    {
      id: '1',
      name: 'Christmas 2024',
      amount: 2000,
      spent: 1450,
      currency: 'USD',
      status: 'on_track',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Birthday Budget',
      amount: 500,
      spent: 320,
      currency: 'USD',
      status: 'under_budget',
      priority: 'medium'
    },
    {
      id: '3',
      name: 'Anniversary Fund',
      amount: 800,
      spent: 950,
      currency: 'USD',
      status: 'over_budget',
      priority: 'critical'
    }
  ];

  const mockInsights: FinancialInsight[] = [
    {
      id: '1',
      type: 'savings',
      title: 'Potential Savings',
      description: 'You could save $150 by buying gifts earlier',
      value: 150,
      currency: 'USD',
      change: 12.5,
      changeType: 'increase',
      actionable: true,
      action: 'Plan purchases 2 weeks earlier',
      priority: 'high'
    },
    {
      id: '2',
      type: 'prediction',
      title: 'Budget Alert',
      description: 'You\'ll likely exceed Christmas budget by $200',
      value: 200,
      currency: 'USD',
      change: -10,
      changeType: 'decrease',
      actionable: true,
      action: 'Adjust budget or reduce spending',
      priority: 'high'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setBudgets(mockBudgets);
      setInsights(mockInsights);
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return `$${amount.toFixed(2)}`;
  };

  const getTotalBudget = () => {
    return budgets.reduce((sum, budget) => sum + budget.amount, 0);
  };

  const getTotalSpent = () => {
    return budgets.reduce((sum, budget) => sum + budget.spent, 0);
  };

  const getTotalRemaining = () => {
    return getTotalBudget() - getTotalSpent();
  };

  const getBudgetProgress = () => {
    const totalBudget = getTotalBudget();
    return totalBudget > 0 ? (getTotalSpent() / totalBudget) * 100 : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on_track':
        return 'bg-green-100 text-green-800';
      case 'over_budget':
        return 'bg-red-100 text-red-800';
      case 'under_budget':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTopInsight = () => {
    return insights.filter(insight => insight.priority === 'high')[0];
  };

  const progress = getBudgetProgress();
  const topInsight = getTopInsight();

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t('budgetManagement.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* Budget Overview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Budget</span>
                <span className="font-medium">{formatCurrency(getTotalBudget())}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Spent</span>
                <span className="font-medium">{formatCurrency(getTotalSpent())}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Remaining</span>
                <span className="font-medium">{formatCurrency(getTotalRemaining())}</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </div>

            {/* Budget Status */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Active Budgets</div>
              {budgets.slice(0, 2).map((budget) => (
                <div key={budget.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-blue-600" />
                    <span className="truncate">{budget.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={getStatusColor(budget.status)}>
                      {budget.status}
                    </Badge>
                    <span className="text-muted-foreground">
                      {formatCurrency(budget.spent)}/{formatCurrency(budget.amount)}
                    </span>
                  </div>
                </div>
              ))}
              {budgets.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  +{budgets.length - 2} more budgets
                </div>
              )}
            </div>

            {/* AI Insight */}
            {topInsight && (
              <div className="border-t pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-3 w-3 text-purple-600" />
                  <span className="text-xs font-medium">AI Insight</span>
                  <Badge className={getPriorityColor(topInsight.priority)}>
                    {topInsight.priority}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <div className="text-xs font-medium">{topInsight.title}</div>
                  <div className="text-xs text-muted-foreground">{topInsight.description}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold">
                      {formatCurrency(topInsight.value, topInsight.currency)}
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${
                      topInsight.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {topInsight.changeType === 'increase' ? (
                        <ArrowUpRight className="h-2 w-2" />
                      ) : (
                        <ArrowDownRight className="h-2 w-2" />
                      )}
                      {topInsight.change}%
                    </div>
                  </div>
                  {topInsight.actionable && topInsight.action && (
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      <Lightbulb className="h-2 w-2 mr-1" />
                      {topInsight.action}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="border-t pt-3">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <Link to="/budgets">
                    <Target className="h-3 w-3 mr-1" />
                    Manage
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="flex-1"
                >
                  <Link to="/budgets">
                    <Brain className="h-3 w-3 mr-1" />
                    Insights
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetManagementWidget; 