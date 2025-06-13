import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Ticket, TicketFilters } from '@/types/ticketing';
import { useToast } from '@/hooks/use-toast';

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTickets = async (filters?: TicketFilters) => {
    try {
      setLoading(true);
      let query = supabase
        .from('tickets')
        .select(`
          *,
          user:users!tickets_user_id_fkey(*),
          assigned_agent:users!tickets_assigned_agent_id_fkey(*),
          tags:ticket_tags(tag:tags(*)),
          comments:ticket_comments(*),
          activities:ticket_activities(*),
          attachments:ticket_attachments(*)
        `);

      if (filters?.search) {
        query = query.ilike('subject', `%${filters.search}%`);
      }

      if (filters?.status?.length) {
        query = query.in('status', filters.status);
      }

      if (filters?.priority?.length) {
        query = query.in('priority', filters.priority);
      }

      if (filters?.assigned_to?.length) {
        query = query.in('assigned_agent_id', filters.assigned_to);
      }

      if (filters?.tags?.length) {
        query = query.contains('tags', filters.tags);
      }

      if (filters?.date_range) {
        query = query
          .gte('created_at', filters.date_range.start)
          .lte('created_at', filters.date_range.end);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      setTickets(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (ticket: Partial<Ticket>) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert([ticket])
        .select()
        .single();

      if (error) throw error;

      setTickets(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
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

      setTickets(prev => prev.map(ticket => 
        ticket.id === id ? { ...ticket, ...data } : ticket
      ));

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTickets(prev => prev.filter(ticket => ticket.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

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
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
  };
};
