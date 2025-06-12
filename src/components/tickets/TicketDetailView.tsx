
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { 
  X, 
  Calendar as CalendarIcon, 
  User, 
  Paperclip, 
  Send, 
  Plus,
  MessageSquare,
  Eye,
  EyeOff,
  Download,
  Tag,
  Clock,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { Ticket, Comment, User as UserType } from '@/types/ticket';
import { format } from 'date-fns';

interface TicketDetailViewProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (ticket: Ticket) => void;
}

const TicketDetailView: React.FC<TicketDetailViewProps> = ({ ticket, isOpen, onClose, onUpdate }) => {
  const [editedTicket, setEditedTicket] = useState<Ticket | null>(ticket);
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(ticket?.due_date ? new Date(ticket.due_date) : undefined);
  const [showCalendar, setShowCalendar] = useState(false);

  // Mock data for agents and available tags
  const availableAgents: UserType[] = [
    { id: 'agent1', email: 'agent1@company.com', name: 'Alice Johnson', role: 'agent', created_at: '2024-01-01T00:00:00Z' },
    { id: 'agent2', email: 'agent2@company.com', name: 'Bob Wilson', role: 'agent', created_at: '2024-01-01T00:00:00Z' },
    { id: 'agent3', email: 'agent3@company.com', name: 'Carol Davis', role: 'agent', created_at: '2024-01-01T00:00:00Z' }
  ];

  const availableTags = ['urgent', 'bug', 'feature', 'billing', 'login', 'authentication', 'ui', 'performance', 'security'];

  // Mock comments for the timeline
  const comments: Comment[] = [
    {
      id: 'comment1',
      ticket_id: ticket?.id || '',
      author_id: ticket?.user_id || '',
      content: 'Initial ticket description and details provided by the user.',
      internal: false,
      created_at: ticket?.created_at || '2024-01-15T10:30:00Z',
      author: ticket?.user
    },
    {
      id: 'comment2',
      ticket_id: ticket?.id || '',
      author_id: 'admin1',
      content: 'Investigating the issue. Will need to check the server logs.',
      internal: true,
      created_at: '2024-01-15T11:00:00Z',
      author: { id: 'admin1', email: 'admin@company.com', name: 'Admin User', role: 'admin', created_at: '2024-01-01T00:00:00Z' }
    },
    {
      id: 'comment3',
      ticket_id: ticket?.id || '',
      author_id: 'admin1',
      content: 'Hi! We have received your ticket and are looking into the issue. We will update you shortly.',
      internal: false,
      created_at: '2024-01-15T11:30:00Z',
      author: { id: 'admin1', email: 'admin@company.com', name: 'Admin User', role: 'admin', created_at: '2024-01-01T00:00:00Z' }
    }
  ];

  React.useEffect(() => {
    setEditedTicket(ticket);
    setDueDate(ticket?.due_date ? new Date(ticket.due_date) : undefined);
  }, [ticket]);

  if (!ticket || !editedTicket) return null;

  const handleSave = () => {
    const updatedTicket = {
      ...editedTicket,
      due_date: dueDate ? dueDate.toISOString() : undefined,
      updated_at: new Date().toISOString()
    };
    onUpdate(updatedTicket);
    onClose();
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    // In a real app, this would save to the database
    console.log('Adding comment:', { content: newComment, internal: isInternal });
    setNewComment('');
  };

  const handleAddTag = () => {
    if (!newTag.trim() || editedTicket.tags.includes(newTag)) return;
    
    setEditedTicket({
      ...editedTicket,
      tags: [...editedTicket.tags, newTag]
    });
    setNewTag('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTicket({
      ...editedTicket,
      tags: editedTicket.tags.filter(tag => tag !== tagToRemove)
    });
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const isOverdue = dueDate && dueDate < new Date();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="min-w-[800px] max-w-[90vw] overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">{editedTicket.subject}</SheetTitle>
              <SheetDescription>
                Ticket #{editedTicket.id.slice(-6).toUpperCase()} • Created {format(new Date(editedTicket.created_at), 'MMM dd, yyyy')}
              </SheetDescription>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status and Priority Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Status & Priority</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Status</label>
                  <Select
                    value={editedTicket.status}
                    onValueChange={(value) => setEditedTicket({ ...editedTicket, status: value as any })}
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
                  <label className="text-sm font-medium mb-2 block">Priority</label>
                  <Select
                    value={editedTicket.priority}
                    onValueChange={(value) => setEditedTicket({ ...editedTicket, priority: value as any })}
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Assignment & Due Date</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Assigned Agent</label>
                  <Select
                    value={editedTicket.assigned_agent_id || 'unassigned'}
                    onValueChange={(value) => setEditedTicket({ 
                      ...editedTicket, 
                      assigned_agent_id: value === 'unassigned' ? undefined : value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {availableAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Due Date</label>
                  <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left font-normal ${!dueDate && "text-muted-foreground"} ${isOverdue && "border-red-500 text-red-600"}`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'MMM dd, yyyy') : 'Set due date'}
                        {isOverdue && <AlertTriangle className="ml-auto h-4 w-4 text-red-500" />}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={(date) => {
                          setDueDate(date);
                          setShowCalendar(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <User className="h-4 w-4 mr-2" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground">Name</label>
                  <p className="font-medium">{editedTicket.user?.name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="font-medium">{editedTicket.user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tags Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <Tag className="h-4 w-4 mr-2" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {editedTicket.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-auto p-0 text-muted-foreground hover:text-foreground"
                        onClick={() => handleRemoveTag(tag)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Select value={newTag} onValueChange={setNewTag}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Add tag..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags
                        .filter(tag => !editedTicket.tags.includes(tag))
                        .map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleAddTag} size="sm" disabled={!newTag}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Description */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{editedTicket.description}</p>
            </CardContent>
          </Card>

          {/* Attachments */}
          {editedTicket.attachments.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center">
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {editedTicket.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{attachment}</span>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline/Comments */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className={`border-l-2 pl-4 ${comment.internal ? 'border-orange-200 bg-orange-50' : 'border-blue-200 bg-blue-50'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm">{comment.author?.name}</span>
                        <Badge variant={comment.internal ? "secondary" : "outline"} className="text-xs">
                          {comment.internal ? (
                            <>
                              <EyeOff className="h-3 w-3 mr-1" />
                              Internal
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Public
                            </>
                          )}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add Comment Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Add Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Textarea
                  placeholder="Type your message..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="internal"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="internal" className="text-sm">
                      Internal note (not visible to customer)
                    </label>
                  </div>
                  <Button onClick={handleAddComment} disabled={!newComment.trim()}>
                    <Send className="h-4 w-4 mr-2" />
                    {isInternal ? 'Add Note' : 'Reply'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TicketDetailView;
