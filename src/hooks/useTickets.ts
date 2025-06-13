
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, TicketFilters } from '@/types/ticketing';
import { useToast } from '@/hooks/use-toast';

export const useTickets = (filters?: TicketFilters) => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('tickets')
        .select(`
          *,
          user:profiles!tickets_user_id_fkey(id, name, email),
          assigned_agent:profiles!tickets_assigned_agent_id_fkey(id, name, email),
          tags:ticket_tags(tag:tags(*)),
          comments(
            *,
            author:profiles(id, name, email),
            attachments(*)
          ),
          attachments(*),
          activities:ticket_activities(
            *,
            user:profiles(id, name, email)
          ),
          rating:ticket_ratings(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }
      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority);
      }
      if (filters?.assigned_agent?.length) {
        query = query.in('assigned_agent_id', filters.assigned_agent);
      }
      if (filters?.search) {
        query = query.or(`subject.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to match our types
      const transformedTickets = data?.map(ticket => ({
        ...ticket,
        tags: ticket.tags?.map((t: any) => t.tag) || [],
        comments: ticket.comments || [],
        attachments: ticket.attachments || [],
        activities: ticket.activities || [],
        rating: ticket.rating?.[0] || null
      })) || [];

      setTickets(transformedTickets);
      setError(null);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
      toast({
        title: "Error",
        description: "Failed to fetch tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticketData: Partial<Ticket>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tickets')
        .insert({
          ...ticketData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ticket created successfully"
      });

      fetchTickets();
      return data;
    } catch (err) {
      console.error('Error creating ticket:', err);
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Ticket updated successfully"
      });

      fetchTickets();
      return data;
    } catch (err) {
      console.error('Error updating ticket:', err);
      toast({
        title: "Error",
        description: "Failed to update ticket",
        variant: "destructive"
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters]);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('tickets-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tickets'
      }, () => {
        fetchTickets();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments'
      }, () => {
        fetchTickets();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    tickets,
    loading,
    error,
    refetch: fetchTickets,
    createTicket,
    updateTicket
  };
};
