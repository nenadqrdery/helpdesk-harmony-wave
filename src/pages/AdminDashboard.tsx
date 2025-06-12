
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import StatsCard from '@/components/dashboard/StatsCard';
import { Ticket, TicketFilters, User } from '@/types/ticket';
import { 
  LogOut, 
  Search, 
  Filter, 
  TicketIcon, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  TrendingUp,
  Users,
  MoreHorizontal,
  User as UserIcon,
  Calendar,
  Paperclip
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  // Mock data
  useEffect(() => {
    const mockUsers: User[] = [
      { id: '1', email: 'john@example.com', name: 'John Doe', role: 'user', created_at: '2024-01-01T00:00:00Z' },
      { id: '2', email: 'jane@example.com', name: 'Jane Smith', role: 'user', created_at: '2024-01-01T00:00:00Z' },
      { id: '3', email: 'mike@example.com', name: 'Mike Johnson', role: 'user', created_at: '2024-01-01T00:00:00Z' }
    ];

    const mockTickets: Ticket[] = [
      {
        id: 'ticket001',
        user_id: '1',
        subject: 'Login issue with my account',
        description: 'I cannot log into my account even with the correct password.',
        status: 'open',
        priority: 'high',
        category: 'Account Problem',
        tags: ['login', 'authentication'],
        attachments: [],
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z',
        user: mockUsers[0]
      },
      {
        id: 'ticket002',
        user_id: '2',
        subject: 'Payment processing error',
        description: 'Getting error when trying to process payment.',
        status: 'pending',
        priority: 'critical',
        category: 'Billing Question',
        tags: ['payment', 'billing'],
        attachments: ['screenshot.png'],
        created_at: '2024-01-14T14:20:00Z',
        updated_at: '2024-01-14T16:45:00Z',
        user: mockUsers[1]
      },
      {
        id: 'ticket003',
        user_id: '1',
        subject: 'Feature request for dark mode',
        description: 'Would love to see dark mode in the application.',
        status: 'in_progress',
        priority: 'low',
        category: 'Feature Request',
        tags: ['ui', 'enhancement'],
        attachments: [],
        created_at: '2024-01-13T09:15:00Z',
        updated_at: '2024-01-14T11:30:00Z',
        user: mockUsers[0]
      },
      {
        id: 'ticket004',
        user_id: '3',
        subject: 'Bug in reporting dashboard',
        description: 'Charts are not loading properly in the dashboard.',
        status: 'resolved',
        priority: 'medium',
        category: 'Bug Report',
        tags: ['dashboard', 'charts'],
        attachments: [],
        created_at: '2024-01-12T08:00:00Z',
        updated_at: '2024-01-13T17:20:00Z',
        user: mockUsers[2]
      },
      {
        id: 'ticket005',
        user_id: '2',
        subject: 'Account verification needed',
        description: 'Need help with account verification process.',
        status: 'closed',
        priority: 'medium',
        category: 'Account Problem',
        tags: ['verification', 'account'],
        attachments: [],
        created_at: '2024-01-10T15:45:00Z',
        updated_at: '2024-01-11T10:15:00Z',
        user: mockUsers[1]
      }
    ];

    setTickets(mockTickets);
  }, []);

  // Filter tickets based on current filters
  useEffect(() => {
    let filtered = tickets;

    if (filters.status) {
      filtered = filtered.filter(ticket => ticket.status === filters.status);
    }

    if (filters.priority) {
      filtered = filtered.filter(ticket => ticket.priority === filters.priority);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower) ||
        ticket.user?.name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTickets(filtered);
  }, [tickets, filters]);

  const updateFilters = (key: keyof TicketFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
      case 'open':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved':
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Calculate stats
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => ['new', 'open', 'in_progress'].includes(t.status)).length;
  const pendingTickets = tickets.filter(t => t.status === 'pending').length;
  const resolvedTickets = tickets.filter(t => ['resolved', 'closed'].includes(t.status)).length;
  const criticalTickets = tickets.filter(t => t.priority === 'critical').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <TicketIcon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-500">Manage all support tickets</p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total Tickets"
            value={totalTickets}
            icon={TicketIcon}
            description="All time tickets"
          />
          <StatsCard
            title="Open Tickets"
            value={openTickets}
            icon={Clock}
            description="Active requests"
            color="blue"
          />
          <StatsCard
            title="Pending"
            value={pendingTickets}
            icon={AlertTriangle}
            description="Awaiting response"
            color="orange"
          />
          <StatsCard
            title="Resolved"
            value={resolvedTickets}
            icon={CheckCircle2}
            description="Completed tickets"
            color="green"
          />
          <StatsCard
            title="Critical"
            value={criticalTickets}
            icon={AlertTriangle}
            description="High priority"
            color="red"
          />
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={filters.search || ''}
                  onChange={(e) => updateFilters('search', e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filters.status || 'all'} onValueChange={(value) => updateFilters('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.priority || 'all'} onValueChange={(value) => updateFilters('priority', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => setFilters({})}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tickets</CardTitle>
            <CardDescription>
              {filteredTickets.length} of {totalTickets} tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div 
                  key={ticket.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(ticket.status)}`}>
                          {formatStatus(ticket.status)}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-muted-foreground line-clamp-2">
                        {ticket.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <UserIcon className="h-4 w-4" />
                          <span>{ticket.user?.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(ticket.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                        {ticket.attachments.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Paperclip className="h-4 w-4" />
                            <span>{ticket.attachments.length}</span>
                          </div>
                        )}
                        <span className="text-xs">#{ticket.id.slice(-6).toUpperCase()}</span>
                      </div>
                      
                      {ticket.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {ticket.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredTickets.length === 0 && (
                <div className="text-center py-8">
                  <TicketIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No tickets found</h3>
                  <p className="text-muted-foreground">
                    No tickets match your current filters.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminDashboard;
