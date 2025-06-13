import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, MessageSquare, Paperclip, User } from 'lucide-react';
import { Ticket } from '@/types/ticketing';
import { format } from 'date-fns';

interface TicketListProps {
  tickets: Ticket[];
  onTicketClick?: (ticket: Ticket) => void;
  showUser?: boolean;
}

const TicketList: React.FC<TicketListProps> = ({ tickets, onTicketClick, showUser = false }) => {
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

  const formatTicketNumber = (id: string) => {
    const numericId = parseInt(id.slice(-6), 16).toString().padStart(6, '0');
    return `#${numericId}`;
  };

  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">No tickets found</h3>
          <p className="text-muted-foreground">No tickets match your current filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card 
          key={ticket.id} 
          className={`transition-all duration-200 hover:shadow-md ${onTicketClick ? 'cursor-pointer' : ''}`}
          onClick={() => onTicketClick?.(ticket)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <CardTitle className="text-lg font-semibold">{ticket.subject}</CardTitle>
                  <Badge variant="outline" className={`text-xs ${getStatusColor(ticket.status)}`}>
                    {formatStatus(ticket.status)}
                  </Badge>
                  <Badge variant="outline" className={`text-xs ${getPriorityColor(ticket.priority)}`}>
                    {ticket.priority.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {ticket.description}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center space-x-4">
                {showUser && ticket.user && (
                  <div className="flex items-center space-x-1">
                    <User className="h-4 w-4" />
                    <span>{ticket.user.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <CalendarDays className="h-4 w-4" />
                  <span>{format(new Date(ticket.created_at), 'MMM dd, yyyy')}</span>
                </div>
                {ticket.attachments.length > 0 && (
                  <div className="flex items-center space-x-1">
                    <Paperclip className="h-4 w-4" />
                    <span>{ticket.attachments.length} attachment{ticket.attachments.length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              <span className="text-xs">{formatTicketNumber(ticket.id)}</span>
            </div>
            {ticket.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {ticket.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="text-xs">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TicketList;
