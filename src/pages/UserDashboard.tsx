import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CreateTicketForm from '@/components/tickets/CreateTicketForm';
import TicketList from '@/components/tickets/TicketList';
import StatsCard from '@/components/dashboard/StatsCard';
import { LogOut, Plus, Ticket as TicketIcon, Clock, CheckCircle2 } from 'lucide-react';
import AdminTicketTable from '@/components/tickets/AdminTicketTable';
import EnhancedTicketDetailView from '@/components/tickets/EnhancedTicketDetailView';
import { useTickets } from '@/hooks/useTickets';
import { Ticket } from '@/types/ticketing';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { tickets, loading, fetchTickets } = useTickets();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const handleTicketClick = (ticket: Ticket) => setSelectedTicket(ticket);
  const handleCloseDetail = () => setSelectedTicket(null);
  const handleUpdateTicket = (updated: Ticket) => {
    // Optionally update the ticket in state or refetch
    fetchTickets();
    setSelectedTicket(updated);
  };

  const openTickets = tickets.filter(t => ['new', 'open', 'in_progress'].includes(t.status));
  const pendingTickets = tickets.filter(t => t.status === 'pending');
  const resolvedTickets = tickets.filter(t => ['resolved', 'closed'].includes(t.status));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Visible banner for confirmation */}
      <div className="w-full bg-green-100 text-green-800 text-center py-2 font-bold">
        🚀 UI UPDATED: You are seeing the new Supabase-powered dashboard!
      </div>
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
        {/* Admin view */}
        {user?.role === 'admin' && (
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Admin Ticket Overview</CardTitle>
                <CardDescription>Manage all tickets in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminTicketTable
                  tickets={tickets}
                  loading={loading}
                  onTicketClick={handleTicketClick}
                  onFiltersChange={fetchTickets}
                />
              </CardContent>
            </Card>
          </div>
        )}

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
                <TicketList tickets={tickets} onTicketClick={handleTicketClick} loading={loading} />
              </CardContent>
            </Card>
            {/* Show ticket detail view if a ticket is selected */}
            {selectedTicket && (
              <EnhancedTicketDetailView 
                ticket={selectedTicket} 
                isOpen={!!selectedTicket}
                onClose={handleCloseDetail}
                onUpdate={handleUpdateTicket}
              />
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <CreateTicketForm onTicketCreated={fetchTickets} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default UserDashboard;
