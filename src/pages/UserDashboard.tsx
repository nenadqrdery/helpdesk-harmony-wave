
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateTicketForm from '@/components/tickets/CreateTicketForm';
import TicketList from '@/components/tickets/TicketList';
import StatsCard from '@/components/dashboard/StatsCard';
import { Ticket } from '@/types/ticket';
import { LogOut, Plus, Ticket as TicketIcon, Clock, CheckCircle2 } from 'lucide-react';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // Mock data for user tickets
  useEffect(() => {
    const mockTickets: Ticket[] = [
      {
        id: 'ticket001',
        user_id: user?.id || '',
        subject: 'Login issue with my account',
        description: 'I cannot log into my account even with the correct password. Getting error message.',
        status: 'open',
        priority: 'high',
        category: 'Account Problem',
        tags: ['login', 'authentication'],
        attachments: [],
        created_at: '2024-01-15T10:30:00Z',
        updated_at: '2024-01-15T10:30:00Z'
      },
      {
        id: 'ticket002',
        user_id: user?.id || '',
        subject: 'Feature request for mobile app',
        description: 'Would love to see dark mode in the mobile application.',
        status: 'pending',
        priority: 'low',
        category: 'Feature Request',
        tags: ['mobile', 'ui'],
        attachments: [],
        created_at: '2024-01-14T14:20:00Z',
        updated_at: '2024-01-14T16:45:00Z'
      },
      {
        id: 'ticket003',
        user_id: user?.id || '',
        subject: 'Billing question about subscription',
        description: 'Need clarification about the billing cycle and charges.',
        status: 'resolved',
        priority: 'medium',
        category: 'Billing Question',
        tags: ['billing', 'subscription'],
        attachments: [],
        created_at: '2024-01-12T09:15:00Z',
        updated_at: '2024-01-13T11:30:00Z'
      }
    ];
    setTickets(mockTickets);
  }, [user?.id, refreshKey]);

  const handleTicketCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const openTickets = tickets.filter(t => ['new', 'open', 'in_progress'].includes(t.status));
  const pendingTickets = tickets.filter(t => t.status === 'pending');
  const resolvedTickets = tickets.filter(t => ['resolved', 'closed'].includes(t.status));

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
                <h1 className="text-xl font-semibold text-gray-900">My Tickets</h1>
                <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Open Tickets"
            value={openTickets.length}
            icon={TicketIcon}
            description="Active support requests"
            color="blue"
          />
          <StatsCard
            title="Pending"
            value={pendingTickets.length}
            icon={Clock}
            description="Awaiting response"
            color="orange"
          />
          <StatsCard
            title="Resolved"
            value={resolvedTickets.length}
            icon={CheckCircle2}
            description="Completed tickets"
            color="green"
          />
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tickets">My Tickets</TabsTrigger>
            <TabsTrigger value="create">
              <Plus className="w-4 h-4 mr-2" />
              Create New
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Support Tickets</CardTitle>
                <CardDescription>
                  View and track the status of your submitted tickets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TicketList tickets={tickets} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="create" className="space-y-6">
            <CreateTicketForm onTicketCreated={handleTicketCreated} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserDashboard;
