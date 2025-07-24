import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard,
  Wallet,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Brain,
  Eye,
  EyeOff,
  RefreshCw,
  Lightbulb,
  PieChart,
  Receipt,
  Gift,
  Coins
} from 'lucide-react';
import { apiService } from '@/services/api';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  currency: string;
  period: 'monthly' | 'quarterly' | 'yearly' | 'custom';
  startDate: Date;
  endDate: Date;
  category: string;
  status: 'on_track' | 'over_budget' | 'under_budget' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  tags: string[];
  notifications: boolean;
  autoAdjust: boolean;
}

interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  recipient: string;
  occasion: string;
  date: Date;
  description: string;
  tags: string[];
  receipt?: string;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: string;
  location?: string;
}

interface FinancialInsight {
  id: string;
  type: 'savings' | 'spending' | 'trend' | 'prediction' | 'optimization';
  title: string;
  description: string;
  value: number;
  currency: string;
  change: number;
  changeType: 'increase' | 'decrease';
  confidence: number;
  actionable: boolean;
  action?: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

const AdvancedBudgetManagement: React.FC = () => {
  const { t } = useTranslation();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 }
  ]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'analytics'>('overview');

  // Mock data
  const mockBudgets: Budget[] = [
    {
      id: '1',
      name: 'Christmas 2024',
      amount: 2000,
      spent: 1450,
      currency: 'USD',
      period: 'yearly',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      category: 'Holiday',
      status: 'on_track',
      priority: 'high',
      description: 'Christmas gifts for family and friends',
      tags: ['christmas', 'family', 'friends'],
      notifications: true,
      autoAdjust: true
    },
    {
      id: '2',
      name: 'Birthday Budget',
      amount: 500,
      spent: 320,
      currency: 'USD',
      period: 'monthly',
      startDate: new Date('2024-12-01'),
      endDate: new Date('2024-12-31'),
      category: 'Personal',
      status: 'under_budget',
      priority: 'medium',
      description: 'Monthly birthday gifts',
      tags: ['birthday', 'monthly'],
      notifications: true,
      autoAdjust: false
    },
    {
      id: '3',
      name: 'Anniversary Fund',
      amount: 800,
      spent: 950,
      currency: 'USD',
      period: 'custom',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2024-12-15'),
      category: 'Special Occasion',
      status: 'over_budget',
      priority: 'critical',
      description: 'Our 10th anniversary celebration',
      tags: ['anniversary', 'special'],
      notifications: true,
      autoAdjust: true
    }
  ];

  const mockExpenses: Expense[] = [
    {
      id: '1',
      amount: 150,
      currency: 'USD',
      category: 'Electronics',
      recipient: 'John Smith',
      occasion: 'Christmas',
      date: new Date('2024-12-10'),
      description: 'Wireless headphones',
      tags: ['tech', 'christmas'],
      status: 'completed',
      paymentMethod: 'Credit Card',
      location: 'Amazon'
    },
    {
      id: '2',
      amount: 75,
      currency: 'USD',
      category: 'Books',
      recipient: 'Sarah Johnson',
      occasion: 'Birthday',
      date: new Date('2024-12-05'),
      description: 'Cooking recipe book',
      tags: ['books', 'cooking'],
      status: 'completed',
      paymentMethod: 'Debit Card',
      location: 'Local Bookstore'
    },
    {
      id: '3',
      amount: 200,
      currency: 'USD',
      category: 'Jewelry',
      recipient: 'Spouse',
      occasion: 'Anniversary',
      date: new Date('2024-12-12'),
      description: 'Silver necklace',
      tags: ['jewelry', 'anniversary'],
      status: 'pending',
      paymentMethod: 'Credit Card',
      location: 'Jewelry Store'
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
      confidence: 85,
      actionable: true,
      action: 'Plan purchases 2 weeks earlier',
      category: 'Timing',
      priority: 'high'
    },
    {
      id: '2',
      type: 'spending',
      title: 'Spending Trend',
      description: 'Your spending is 15% higher than last year',
      value: 15,
      currency: 'USD',
      change: 15,
      changeType: 'increase',
      confidence: 92,
      actionable: true,
      action: 'Review budget categories',
      category: 'Analysis',
      priority: 'medium'
    },
    {
      id: '3',
      type: 'prediction',
      title: 'Budget Prediction',
      description: 'You\'ll likely exceed your Christmas budget by $200',
      value: 200,
      currency: 'USD',
      change: -10,
      changeType: 'decrease',
      confidence: 78,
      actionable: true,
      action: 'Adjust budget or reduce spending',
      category: 'Forecasting',
      priority: 'high'
    },
    {
      id: '4',
      type: 'optimization',
      title: 'Category Optimization',
      description: 'Electronics spending is 40% above average',
      value: 40,
      currency: 'USD',
      change: 40,
      changeType: 'increase',
      confidence: 88,
      actionable: true,
      action: 'Consider alternative gift categories',
      category: 'Optimization',
      priority: 'medium'
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setBudgets(mockBudgets);
      setExpenses(mockExpenses);
      setInsights(mockInsights);
    } catch (error) {
      console.error('Failed to load budget data:', error);
    } finally {
      setLoading(false);
    }
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'savings': return TrendingDown;
      case 'spending': return TrendingUp;
      case 'trend': return BarChart3;
      case 'prediction': return Calendar;
      case 'optimization': return Target;
      default: return Target;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const currencyData = currencies.find(c => c.code === currency);
    const symbol = currencyData?.symbol || '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const calculateBudgetProgress = (budget: Budget) => {
    return (budget.spent / budget.amount) * 100;
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

  const getExpensesByCategory = () => {
    const categories: { [key: string]: number } = {};
    expenses.forEach(expense => {
      categories[expense.category] = (categories[expense.category] || 0) + expense.amount;
    });
    return categories;
  };

  const getTopInsights = () => {
    return insights.filter(insight => insight.priority === 'high').slice(0, 3);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-left">{t('budgetManagement.title')}</h1>
          <p className="text-muted-foreground text-left">{t('budgetManagement.description')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setShowInsights(!showInsights)}>
            {showInsights ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showInsights ? t('budgetManagement.hideInsights') : t('budgetManagement.showInsights')}
          </Button>
          <Button onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t('common.refresh')}
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(getTotalBudget())}</div>
                <div className="text-sm text-muted-foreground">{t('budgetManagement.totalBudget')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(getTotalSpent())}</div>
                <div className="text-sm text-muted-foreground">{t('budgetManagement.totalSpent')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{formatCurrency(getTotalRemaining())}</div>
                <div className="text-sm text-muted-foreground">{t('budgetManagement.remaining')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{budgets.length}</div>
                <div className="text-sm text-muted-foreground">{t('budgetManagement.activeBudgets')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      {showInsights && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('budgetManagement.aiInsights')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getTopInsights().map((insight) => {
                const InsightIcon = getInsightIcon(insight.type);
                
                return (
                  <div key={insight.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <InsightIcon className="h-4 w-4 text-blue-600" />
                      <Badge className={getPriorityColor(insight.priority)}>
                        {insight.priority}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="font-semibold">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold">
                        {formatCurrency(insight.value, insight.currency)}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${
                        insight.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {insight.changeType === 'increase' ? (
                          <ArrowUpRight className="h-3 w-3" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3" />
                        )}
                        {insight.change}%
                      </div>
                    </div>
                    {insight.actionable && insight.action && (
                      <Button size="sm" variant="outline" className="w-full">
                        <Lightbulb className="h-3 w-3 mr-1" />
                        {insight.action}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budgets Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budgets List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('budgetManagement.budgets')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : budgets.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t('budgetManagement.noBudgets')}</h3>
                  <p className="text-muted-foreground">{t('budgetManagement.noBudgetsDescription')}</p>
                </div>
              ) : (
                budgets.map((budget) => {
                  const progress = calculateBudgetProgress(budget);
                  
                  return (
                    <div key={budget.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{budget.name}</h3>
                            <Badge className={getStatusColor(budget.status)}>
                              {budget.status}
                            </Badge>
                            <Badge className={getPriorityColor(budget.priority)}>
                              {budget.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {budget.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{budget.category}</span>
                            <span>{budget.period}</span>
                            <span>{budget.currency}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {formatCurrency(budget.spent, budget.currency)} / {formatCurrency(budget.amount, budget.currency)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatCurrency(budget.amount - budget.spent, budget.currency)} remaining
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t('budgetManagement.progress')}</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {budget.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t('budgetManagement.expenseCategories')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(getExpensesByCategory()).map(([category, amount]) => (
                <div key={category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <div>
                      <div className="font-medium">{category}</div>
                      <div className="text-sm text-muted-foreground">
                        {expenses.filter(e => e.category === category).length} expenses
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(amount)}</div>
                    <div className="text-sm text-muted-foreground">
                      {((amount / getTotalSpent()) * 100).toFixed(1)}% of total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            {t('budgetManagement.recentExpenses')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenses.slice(0, 5).map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Gift className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">{expense.description}</div>
                    <div className="text-sm text-muted-foreground">
                      {expense.recipient} • {expense.occasion}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{formatCurrency(expense.amount, expense.currency)}</div>
                  <div className="text-sm text-muted-foreground">
                    {expense.date.toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            {t('budgetManagement.currencySettings')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold">{t('budgetManagement.primaryCurrency')}</h3>
              <div className="grid grid-cols-2 gap-2">
                {currencies.map((currency) => (
                  <Button
                    key={currency.code}
                    variant={selectedCurrency === currency.code ? "default" : "outline"}
                    onClick={() => setSelectedCurrency(currency.code)}
                    className="justify-start"
                  >
                    <span className="mr-2">{currency.symbol}</span>
                    {currency.name} ({currency.code})
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">{t('budgetManagement.exchangeRates')}</h3>
              <div className="space-y-2">
                {currencies.filter(c => c.code !== selectedCurrency).map((currency) => (
                  <div key={currency.code} className="flex items-center justify-between p-2 border rounded">
                    <span>{currency.code}</span>
                    <span className="text-muted-foreground">
                      1 {selectedCurrency} = {currency.rate.toFixed(2)} {currency.code}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedBudgetManagement; 