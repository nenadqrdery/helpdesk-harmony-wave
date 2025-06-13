
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Ticket, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Filter,
  Settings
} from 'lucide-react';
import { useTickets } from '@/hooks/useTickets';
import { useAuth } from '@/hooks/useAuth';
import { TicketFilters } from '@/types/ticketing';
import TicketTable from '@/components/tickets/TicketTable';
import EnhancedTicketDetailView from '@/components/tickets/EnhancedTicketDetailView';
import { Ticket as TicketType } from '@/types/ticketing';

const EnhancedAdminDashboard = () => {
  const { profile, isAdmin, isAgent } = useAuth();
  const [filters, setFilters] = useState<TicketFilters>({});
  const { tickets, loading, updateTicket } = useTickets(filters);
  const [selectedTicket, setSelectedTicket] = useState<TicketType | null>(null);
  const [isDetailViewOpen, setIsDetailViewOpen] = useState(false);

  // Redirect non-admin users
  if (!isAdmin && !isAgent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-orange-500" />
            <h3 className="mt-4 text-lg font-semibold">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const stats = {
    total: tickets.length,
    new: tickets.filter(t => t.status === 'new').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    pending: tickets.filter(t => t.status === 'pending').length,
    resolved: tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length,
    critical: tickets.filter(t => t.priority === 'critical').length,
    overdue: tickets.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && !['resolved', 'closed'].includes(t.status)
    ).length
  };

  // Mock chart data (in real app, this would come from analytics)
  const chartData = [
    { name: 'Mon', tickets: 12, resolved: 8 },
    { name: 'Tue', tickets: 15, resolved: 11 },
    { name: 'Wed', tickets: 8, resolved: 6 },
    { name: 'Thu', tickets: 20, resolved: 14 },
    { name: 'Fri', tickets: 18, resolved: 16 },
    { name: 'Sat', tickets: 5, resolved: 4 },
    { name: 'Sun', tickets: 7, resolved: 5 }
  ];

  const statusData = [
    { name: 'New', value: stats.new, color: '#10b981' },
    { name: 'In Progress', value: stats.inProgress, color: '#3b82f6' },
    { name: 'Pending', value: stats.pending, color: '#f59e0b' },
    { name: 'Resolved', value: stats.resolved, color: '#6b7280' }
  ];

  const handleTicketClick = (ticket: TicketType) => {
    setSelectedTicket(ticket);
    setIsDetailViewOpen(true);
  };

  const handleTicketUpdate = async (updatedTicket: TicketType) => {
    try {
      await updateTicket(updatedTicket.id, updatedTicket);
      setSelectedTicket(updatedTicket);
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.name}. Here's what's happening with your tickets.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+2.5%</span> from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Tickets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.new}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">
              Currently being worked on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Cards */}
      {(stats.critical > 0 || stats.overdue > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.critical > 0 && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Critical Priority Tickets</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">
                  You have {stats.critical} critical priority ticket{stats.critical > 1 ? 's' : ''} that need immediate attention.
                </p>
              </CardContent>
            </Card>
          )}

          {stats.overdue > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="text-orange-800 flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Overdue Tickets</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700">
                  {stats.overdue} ticket{stats.overdue > 1 ? 's are' : ' is'} past the due date.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Analytics and Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tickets">All Tickets</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ticket Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Ticket Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="tickets" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tickets Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.slice(0, 5).map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => handleTicketClick(ticket)}
                  >
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline" className="text-xs">
                        #{ticket.id.slice(-6)}
                      </Badge>
                      <div>
                        <p className="font-medium">{ticket.subject}</p>
                        <p className="text-sm text-muted-foreground">{ticket.user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {ticket.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {ticket.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tickets">
          <TicketTable
            tickets={tickets}
            loading={loading}
            onTicketClick={handleTicketClick}
            onFiltersChange={setFilters}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Resolution Rate</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">87%</div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-green-600">+5%</span> from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Avg Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2.4h</div>
                <p className="text-sm text-muted-foreground">
                  <span className="text-green-600">-15min</span> from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Satisfaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">4.6/5</div>
                <p className="text-sm text-muted-foreground">
                  Based on 127 ratings
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Enhanced Ticket Detail View */}
      <EnhancedTicketDetailView
        ticket={selectedTicket}
        isOpen={isDetailViewOpen}
        onClose={() => setIsDetailViewOpen(false)}
        onUpdate={handleTicketUpdate}
      />
    </div>
  );
};

export default EnhancedAdminDashboard;
