import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CalendarIcon, Download, BarChart3, PieChart, TrendingUp, Users, Gift, DollarSign, Calendar, FileText, Filter, RefreshCw } from 'lucide-react';
import { apiService } from '@/services/api';
import { Analytics, Report } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const AnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dateRange: { start: '', end: '' },
    people: [] as string[],
    occasions: [] as string[],
    categories: [] as string[],
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [newReport, setNewReport] = useState({
    type: 'gift_summary' as Report['type'],
    title: '',
    description: '',
    isScheduled: false,
    scheduleFrequency: 'monthly' as Report['scheduleFrequency'],
    filters: {} as Report['filters'],
    data: {},
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, reportsData] = await Promise.all([
        apiService.getAnalytics(filters),
        apiService.getReports(),
      ]);
      
      console.log('Reports data received:', reportsData);
      
      // Extract arrays from responses (handle both direct arrays and objects with data property)
      const reportsArray = Array.isArray(reportsData) ? reportsData : (reportsData?.reports || reportsData?.data || []);
      
      console.log('Reports array after extraction:', reportsArray);
      
      setAnalytics(analyticsData);
      setReports(reportsArray);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReport = async () => {
    try {
      const result = await apiService.createReport(newReport);
      console.log('Report created:', result);
      setShowCreateReport(false);
      setNewReport({
        type: 'gift_summary',
        title: '',
        description: '',
        isScheduled: false,
        scheduleFrequency: 'monthly',
        filters: {},
        data: {},
      });
      // Add a small delay to ensure the database has updated
      setTimeout(() => {
        loadData();
      }, 100);
    } catch (error) {
      console.error('Error creating report:', error);
    }
  };

  const handleExportReport = async (reportId: string, format: 'pdf' | 'csv' | 'json') => {
    try {
      const blob = await apiService.exportReport(reportId, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      // Use .txt extension for PDF format since we're returning text
      const fileExtension = format === 'pdf' ? 'txt' : format;
      a.download = `report-${reportId}.${fileExtension}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      await apiService.deleteReport(reportId);
      loadData();
    } catch (error) {
      console.error('Error deleting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-left">Analytics & Reports</h1>
          <p className="text-muted-foreground text-left">Track your gift giving patterns and generate insights</p>
        </div>
        <Button onClick={() => setShowCreateReport(true)}>
          <FileText className="mr-2 h-4 w-4" />
          Create Report
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>People</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select people" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All People</SelectItem>
                  <SelectItem value="family">Family Only</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Occasions</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select occasions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Occasions</SelectItem>
                  <SelectItem value="birthday">Birthdays</SelectItem>
                  <SelectItem value="christmas">Christmas</SelectItem>
                  <SelectItem value="anniversary">Anniversaries</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Categories</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gifts</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.giftStats.totalGifts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.giftStats.completedGifts || 0} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics?.giftStats.totalSpent?.toLocaleString() || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Avg: ${analytics?.giftStats.averageGiftPrice?.toFixed(2) || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">People</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.peopleStats.totalPeople || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.peopleStats.averageGiftsPerPerson?.toFixed(1) || 0} gifts per person
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occasions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.occasionStats.totalOccasions || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics?.occasionStats.upcomingOccasions || 0} upcoming
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Budget Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Budget Utilization</CardTitle>
              <CardDescription>How well you're staying within your budgets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Utilization</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics?.budgetStats.averageBudgetUtilization?.toFixed(1) || 0}%
                  </span>
                </div>
                <Progress value={analytics?.budgetStats.averageBudgetUtilization || 0} className="w-full" />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Budget:</span>
                    <span className="ml-2 font-medium">
                      ${analytics?.budgetStats.totalBudgetAmount?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Spent:</span>
                    <span className="ml-2 font-medium">
                      ${analytics?.budgetStats.totalSpent?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Breakdown of your gift spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.categoryBreakdown?.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-primary" />
                      <span className="text-sm font-medium">{category.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${category.totalSpent.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{category.count} gifts</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Recipients */}
          <Card>
            <CardHeader>
              <CardTitle>Top Recipients</CardTitle>
              <CardDescription>People you spend the most on</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.spendingByPerson?.slice(0, 5).map((person, index) => (
                  <div key={person.personName} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{person.personName}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${person.totalSpent.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">{person.giftCount} gifts</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Trends</CardTitle>
              <CardDescription>Your gift giving patterns over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.monthlyTrends?.map((trend) => (
                  <div key={trend.month} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{trend.month}</div>
                      <div className="text-sm text-muted-foreground">{trend.occasions} occasions</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{trend.giftsPurchased} gifts</div>
                      <div className="text-sm text-muted-foreground">
                        ${trend.amountSpent.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Saved Reports</h3>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        {report.title}
                      </CardTitle>
                      <CardDescription>{report.description}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{report.type.replace('_', ' ')}</Badge>
                      {report.isScheduled && (
                        <Badge variant="outline">{report.scheduleFrequency}</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Created: {new Date(report.createdAt).toLocaleDateString()}
                      {report.lastGenerated && (
                        <span className="ml-4">
                          Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportReport(report.id, 'pdf')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportReport(report.id, 'csv')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        CSV
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Report Dialog */}
      <Dialog open={showCreateReport} onOpenChange={setShowCreateReport}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Report</DialogTitle>
            <DialogDescription>
              Generate a custom report with your preferred filters and schedule.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Report Title</Label>
              <Input
                id="title"
                value={newReport.title}
                onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                placeholder="Enter report title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                placeholder="Enter report description"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Report Type</Label>
              <Select
                value={newReport.type}
                onValueChange={(value: Report['type']) =>
                  setNewReport({ ...newReport, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gift_summary">Gift Summary</SelectItem>
                  <SelectItem value="budget_report">Budget Report</SelectItem>
                  <SelectItem value="occasion_report">Occasion Report</SelectItem>
                  <SelectItem value="spending_analysis">Spending Analysis</SelectItem>
                  <SelectItem value="family_report">Family Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="scheduled"
                checked={newReport.isScheduled}
                onCheckedChange={(checked) =>
                  setNewReport({ ...newReport, isScheduled: checked })
                }
              />
              <Label htmlFor="scheduled">Schedule Report</Label>
            </div>
            {newReport.isScheduled && (
              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={newReport.scheduleFrequency}
                  onValueChange={(value: Report['scheduleFrequency']) =>
                    setNewReport({ ...newReport, scheduleFrequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateReport(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReport}>Create Report</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnalyticsPage; 