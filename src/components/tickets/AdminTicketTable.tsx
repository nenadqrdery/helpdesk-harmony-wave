import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Calendar,
  User,
  Tag as TagIcon,
  ArrowUpDown,
  GripVertical
} from 'lucide-react';
import { Ticket, TicketFilters } from '@/types/ticketing';
import { format } from 'date-fns';

interface Column {
  id: string;
  label: string;
  width: number;
  sortable?: boolean;
}

interface AdminTicketTableProps {
  tickets: Ticket[];
  loading: boolean;
  onTicketClick: (ticket: Ticket) => void;
  onFiltersChange: (filters: TicketFilters) => void;
}

const defaultColumns: Column[] = [
  { id: 'id', label: 'Ticket ID', width: 120, sortable: true },
  { id: 'subject', label: 'Subject', width: 300, sortable: true },
  { id: 'status', label: 'Status', width: 120, sortable: true },
  { id: 'priority', label: 'Priority', width: 120, sortable: true },
  { id: 'user', label: 'User', width: 200, sortable: true },
  { id: 'assigned_to', label: 'Assigned To', width: 200, sortable: true },
  { id: 'created_at', label: 'Created', width: 150, sortable: true },
  { id: 'updated_at', label: 'Updated', width: 150, sortable: true },
];

const AdminTicketTable: React.FC<AdminTicketTableProps> = ({
  tickets,
  loading,
  onTicketClick,
  onFiltersChange
}) => {
  const [columns, setColumns] = useState<Column[]>(defaultColumns);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(columns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setColumns(items);
  };

  const handleSort = (columnId: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === columnId && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: columnId, direction });
  };

  const sortedTickets = React.useMemo(() => {
    if (!sortConfig) return tickets;

    return [...tickets].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Ticket];
      const bValue = b[sortConfig.key as keyof Ticket];

      if (aValue === bValue) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }, [tickets, sortConfig]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const newFilters = { ...filters, search: value || undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleStatusFilter = (status: string) => {
    const newFilters = { ...filters, status: status ? [status] : undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePriorityFilter = (priority: string) => {
    const newFilters = { ...filters, priority: priority ? [priority] : undefined };
    setFilters(newFilters);
    onFiltersChange(newFilters);
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tickets</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4 mt-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Select onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={handlePriorityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Priorities</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="columns" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="overflow-x-auto"
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column, index) => (
                        <Draggable
                          key={column.id}
                          draggableId={column.id}
                          index={index}
                        >
                          {(provided) => (
                            <TableHead
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              style={{
                                ...provided.draggableProps.style,
                                width: column.width,
                              }}
                            >
                              <div className="flex items-center space-x-2">
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab"
                                >
                                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <span>{column.label}</span>
                                {column.sortable && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={() => handleSort(column.id)}
                                  >
                                    <ArrowUpDown className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </TableHead>
                          )}
                        </Draggable>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTickets.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => onTicketClick(ticket)}
                      >
                        {columns.map((column) => (
                          <TableCell key={column.id}>
                            {renderCell(ticket, column.id)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};

const renderCell = (ticket: Ticket, columnId: string) => {
  switch (columnId) {
    case 'id':
      return (
        <span className="font-mono text-sm">
          #{ticket.id.slice(-6)}
        </span>
      );
    case 'subject':
      return (
        <div className="max-w-xs truncate">
          {ticket.subject}
        </div>
      );
    case 'status':
      return (
        <Badge variant="outline" className={`text-xs ${getStatusColor(ticket.status)}`}>
          {ticket.status.replace('_', ' ').toUpperCase()}
        </Badge>
      );
    case 'priority':
      return (
        <Badge variant="outline" className={`text-xs ${getPriorityColor(ticket.priority)}`}>
          {ticket.priority.toUpperCase()}
        </Badge>
      );
    case 'user':
      return (
        <div className="flex items-center space-x-2">
          <User className="h-3 w-3" />
          <span className="text-sm truncate">{ticket.user?.name}</span>
        </div>
      );
    case 'assigned_to':
      return ticket.assigned_agent ? (
        <div className="flex items-center space-x-2">
          <User className="h-3 w-3" />
          <span className="text-sm truncate">{ticket.assigned_agent.name}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">Unassigned</span>
      );
    case 'created_at':
      return (
        <div className="flex items-center space-x-2">
          <Calendar className="h-3 w-3" />
          <span className="text-sm">
            {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
          </span>
        </div>
      );
    case 'updated_at':
      return (
        <div className="flex items-center space-x-2">
          <Calendar className="h-3 w-3" />
          <span className="text-sm">
            {format(new Date(ticket.updated_at), 'MMM dd, yyyy')}
          </span>
        </div>
      );
    default:
      return null;
  }
};

export default AdminTicketTable; 