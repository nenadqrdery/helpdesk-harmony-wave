import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send,
  Paperclip,
  Plus,
  Clock,
  User,
  FileText,
  Activity,
  Star,
  Tag as TagIcon,
  X
} from 'lucide-react';
import { Ticket, Comment, TicketActivity } from '@/types/ticketing';
import { useComments } from '@/hooks/useComments';
import { useTags } from '@/hooks/useTags';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useRealtime } from '@/hooks/useRealtime';

interface EnhancedTicketDetailViewProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (ticket: Ticket) => void;
}

const EnhancedTicketDetailView: React.FC<EnhancedTicketDetailViewProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdate
}) => {
  const { toast } = useToast();
  const { addComment, loading: commentLoading } = useComments();
  const { tags, createTag, addTagToTicket, removeTagFromTicket } = useTags();
  const { subscribeToTicket } = useRealtime();
  
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (ticket) {
      setEditingTicket({ ...ticket });
      setComments(ticket.comments || []);
      
      // Subscribe to real-time updates for this ticket
      const unsubscribe = subscribeToTicket(ticket.id, (updatedTicket) => {
        setEditingTicket(updatedTicket);
        setComments(updatedTicket.comments || []);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [ticket, subscribeToTicket]);

  if (!ticket || !editingTicket) return null;

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

  const handleSave = () => {
    onUpdate(editingTicket);
    toast({
      title: "Success",
      description: "Ticket updated successfully"
    });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      const comment = await addComment(ticket.id, newMessage, false, attachedFiles);
      setComments(prev => [...prev, comment]);
      setNewMessage('');
      setAttachedFiles([]);
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    
    try {
      await addComment(ticket.id, newNote, true, attachedFiles);
      setNewNote('');
      setAttachedFiles([]);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      const newTag = await createTag(newTagName);
      await addTagToTicket(ticket.id, newTag.id);
      setNewTagName('');
      toast({
        title: "Success",
        description: "Tag created and added to ticket"
      });
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const handleFileAttachment = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full max-w-4xl">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
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
          </SheetTitle>
        </SheetHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                
                <div className="grid grid-cols-2 gap-4">
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
                </div>
              </CardContent>
            </Card>

            {/* Communication Tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Communication & Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="messages" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="messages">Messages</TabsTrigger>
                    <TabsTrigger value="notes">Internal Notes</TabsTrigger>
                    <TabsTrigger value="activity">Activity Log</TabsTrigger>
                  </TabsList>

                  <TabsContent value="messages" className="space-y-4">
                    <ScrollArea className="h-96 w-full">
                      <div className="space-y-4">
                        {comments.filter(comment => !comment.internal).map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>
                                {comment.is_admin ? 'A' : comment.user?.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-muted p-3 rounded-lg">
                                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                                {comment.attachments?.length > 0 && (
                                  <div className="mt-2 space-y-2">
                                    {comment.attachments.map((attachment) => (
                                      <div key={attachment.id} className="flex items-center space-x-2 text-sm">
                                        <Paperclip className="h-4 w-4" />
                                        <a 
                                          href={attachment.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-primary hover:underline"
                                        >
                                          {attachment.name}
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {comment.is_admin ? 'Admin' : comment.user?.name} • {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="min-h-[100px]"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input
                            type="file"
                            multiple
                            onChange={handleFileAttachment}
                            className="hidden"
                            id="file-attachment"
                          />
                          <label htmlFor="file-attachment">
                            <Button variant="outline" size="sm" type="button">
                              <Paperclip className="h-4 w-4 mr-2" />
                              Attach Files
                            </Button>
                          </label>
                          {attachedFiles.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-muted-foreground">
                                {attachedFiles.length} file(s) selected
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setAttachedFiles([])}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        <Button 
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || commentLoading}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Send Message
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4">
                    <ScrollArea className="h-96 w-full">
                      <div className="space-y-4">
                        {comments.filter(comment => comment.internal).map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <Avatar className="w-8 h-8">
                              <AvatarFallback>{comment.user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                                <p className="text-sm">{comment.content}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {comment.user?.name} • {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>

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
                      <Button 
                        onClick={handleAddNote} 
                        disabled={commentLoading}
                        variant="outline" 
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Note
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-4">
                    <ScrollArea className="h-96 w-full">
                      <div className="space-y-3">
                        {ticket.activities?.map((activity) => (
                          <div key={activity.id} className="flex space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm">{activity.description}</p>
                              <p className="text-xs text-muted-foreground">
                                {activity.user?.name} • {format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Tags Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TagIcon className="w-5 h-5" />
                  <span>Tags</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {ticket.tags?.map((tag) => (
                    <Badge 
                      key={tag.id} 
                      variant="secondary"
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                      className="cursor-pointer"
                      onClick={() => removeTagFromTicket(ticket.id, tag.id)}
                    >
                      {tag.name} ×
                    </Badge>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <Input
                    placeholder="Create new tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                  />
                  <Button onClick={handleCreateTag}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-2 pb-6">
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>

          {/* Tags Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TagIcon className="w-5 h-5" />
                <span>Tags</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {ticket.tags?.map((tag) => (
                  <Badge 
                    key={tag.id} 
                    variant="secondary"
                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    className="cursor-pointer"
                    onClick={() => removeTagFromTicket(ticket.id, tag.id)}
                  >
                    {tag.name} ×
                  </Badge>
                ))}
              </div>
              
              <div className="flex space-x-2">
                <Input
                  placeholder="Create new tag..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                />
                <Button onClick={handleCreateTag}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default EnhancedTicketDetailView;
