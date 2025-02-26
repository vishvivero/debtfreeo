
import React from 'react';
import { useVisitorMetrics } from '@/hooks/use-visitor-metrics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VisitorMap } from './VisitorMap';
import { BlogMetricsChart } from './BlogMetricsChart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Eye, FileText, Activity, UserCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export const AdminMetrics = () => {
  const { data: metrics, isLoading, error } = useVisitorMetrics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Error loading metrics: {error.message}
      </div>
    );
  }

  const statsCards = [
    {
      title: "Unique Visitors",
      value: metrics?.uniqueVisitors || 0,
      icon: Users,
      description: "Total unique visitors"
    },
    {
      title: "Total Visits",
      value: metrics?.totalVisits || 0,
      icon: Eye,
      description: "Total page visits"
    },
    {
      title: "Total Debts",
      value: metrics?.totalDebts || 0,
      icon: FileText,
      description: "Active debt entries"
    },
    {
      title: "Active Users",
      value: metrics?.uniqueVisitors || 0,
      icon: Activity,
      description: "Currently active users"
    },
    {
      title: "Total Profiles",
      value: metrics?.totalProfiles || 0,
      icon: UserCircle,
      description: "Registered users"
    }
  ];

  // Process visitTrends data to ensure proper date formatting and sorting
  const processedVisitTrends = metrics?.visitTrends
    ?.map(trend => ({
      ...trend,
      date: new Date(trend.date).toISOString().split('T')[0],
      visits: Number(trend.visits)
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];

  // Calculate top pages from visit data
  const topPages = metrics?.pageVisits?.sort((a, b) => b.visits - a.visits).slice(0, 5) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statsCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Daily Visitor Trends</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={processedVisitTrends}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs"
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis 
                  className="text-xs"
                  label={{ 
                    value: 'Number of Visits', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' }
                  }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value} visits`, 'Visits']}
                  labelFormatter={(date: string) => format(new Date(date), 'MMMM dd, yyyy')}
                />
                <Line 
                  type="monotone" 
                  dataKey="visits" 
                  stroke="#34D399" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Visitor Locations</CardTitle>
          </CardHeader>
          <CardContent>
            <VisitorMap geoData={metrics?.geoData || []} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground truncate max-w-[70%]">
                    {page.path || 'Unknown'}
                  </span>
                  <span className="text-sm font-medium">{page.visits.toLocaleString()}</span>
                </div>
              ))}
              {topPages.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No page visits recorded yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blog Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <BlogMetricsChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
