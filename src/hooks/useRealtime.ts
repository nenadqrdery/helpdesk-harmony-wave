import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Ticket } from '@/types/ticketing';

export const useRealtime = () => {
  const subscribeToTicket = (ticketId: string, callback: (ticket: Ticket) => void) => {
    const subscription = supabase
      .channel(`ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticketId}`,
        },
        (payload) => {
          callback(payload.new as Ticket);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  return {
    subscribeToTicket,
  };
}; 