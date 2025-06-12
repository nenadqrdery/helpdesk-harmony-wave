import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { 
  CalendarDays, 
  Clock, 
  User, 
  MessageSquare, 
  FileText, 
  Tag,
  AlertTriangle,
  Plus,
  Send,
  Paperclip,
  Download
} from 'lucide-react';
import { Ticket } from '@/types/ticket';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface TicketDetailViewProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (ticket: Ticket) => void;
}

const TicketDetailView: React.FC<TicketDetailViewProps> = ({ 
  ticket, 
  isOpen, 
  onClose, 
  onUpdate 
}) => {
  const { toast } = useToast();
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  React.useEffect(() => {
    if (ticket) {
      setEditingTicket({ ...ticket });
    }
  }, [ticket]);

  if (!ticket || !editingTicket) return null;

  const handleSave = () => {
    onUpdate(editingTicket);
    toast({
      title: "Ticket updated",
      description: "The ticket has been successfully updated.",
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    
    toast({
      title: "Message sent",
      description: "Your message has been sent to the user.",
    });
    setNewMessage('');
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    toast({
      title: "Note added",
      description: "Internal note has been added to the ticket.",
    });
    setNewNote('');
  };

  const formatTicketNumber = (id: string) => {
    const hash = id.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const positiveHash = Math.abs(hash);
    const sixDigitNumber = positiveHash % 1000000;
    return `#${sixDigitNumber.toString().padStart(6, '0')}`;
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span>{ticket.subject}</span>
              <Badge variant="outline" className={`text-xs ${getStatusColor(editingTicket.status)}`}>
                {editingTicket.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <Badge variant="outline" className={`text-xs ${getPriorityColor(editingTicket.priority)}`}>
                {editingTicket.priority.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatTicketNumber(ticket.id)}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Ticket Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Ticket Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={editingTicket.subject}
                    onChange={(e) => setEditingTicket({...editingTicket, subject: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingTicket.description}
                    onChange={(e) => setEditingTicket({...editingTicket, description: e.target.value})}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Messages & Notes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5" />
                  <span>Communication</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="messages" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="notes">Internal Notes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="messages" className="space-y-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {/* Mock conversation */}
                      <div className="flex space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{ticket.user?.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm">{ticket.description}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {ticket.user?.name} • {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="newMessage">Reply to customer</Label>
                      <Textarea
                        id="newMessage"
                        placeholder="Type your response..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleSendMessage} className="w-full">
                        <Send className="w-4 h-4 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="notes" className="space-y-4">
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      <p className="text-sm text-muted-foreground">No internal notes yet.</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <Label htmlFor="newNote">Add internal note</Label>
                      <Textarea
                        id="newNote"
                        placeholder="Add a note for your team..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        rows={3}
                      />
                      <Button onClick={handleAddNote} variant="outline" className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Customer</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarFallback>{ticket.user?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ticket.user?.name}</p>
                    <p className="text-sm text-muted-foreground">{ticket.user?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ticket Properties */}
            <Card>
              <CardHeader>
                <CardTitle>Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editingTicket.status}
                    onValueChange={(value) => setEditingTicket({...editingTicket, status: value as Ticket['status']})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={editingTicket.priority}
                    onValueChange={(value) => setEditingTicket({...editingTicket, priority: value as Ticket['priority']})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Due Date</Label>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarDays className="mr-2 h-4 w-4" />
                        {editingTicket.due_date
                          ? format(new Date(editingTicket.due_date), 'PPP')
                          : 'Set due date'
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editingTicket.due_date ? new Date(editingTicket.due_date) : undefined}
                        onSelect={(date) => {
                          setEditingTicket({
                            ...editingTicket,
                            due_date: date?.toISOString()
                          });
                          setIsCalendarOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editingTicket.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                {editingTicket.attachments.length > 0 && (
                  <div>
                    <Label>Attachments</Label>
                    <div className="space-y-2 mt-2">
                      {editingTicket.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center space-x-2">
                            <Paperclip className="w-4 h-4" />
                            <span className="text-sm">{attachment}</span>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TicketDetailView;
