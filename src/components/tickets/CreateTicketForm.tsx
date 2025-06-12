
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface CreateTicketFormProps {
  onTicketCreated: () => void;
}

const CreateTicketForm: React.FC<CreateTicketFormProps> = ({ onTicketCreated }) => {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Technical Issue',
    'Account Problem',
    'Billing Question',
    'Feature Request',
    'Bug Report',
    'General Inquiry'
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!subject.trim() || !description.trim() || !category) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, this would send data to the backend
      const newTicket = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: user?.id || '',
        subject,
        description,
        category,
        priority,
        status: 'new' as const,
        attachments: attachments.map(f => f.name),
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('New ticket created:', newTicket);

      // Reset form
      setSubject('');
      setDescription('');
      setCategory('');
      setPriority('medium');
      setAttachments([]);

      toast({
        title: "Ticket Created Successfully",
        description: "Your support ticket has been submitted and you will receive a confirmation email shortly.",
      });

      onTicketCreated();
    } catch (error) {
      setError('Failed to create ticket. Please try again.');
      toast({
        title: "Error",
        description: "Failed to create ticket. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create New Ticket</CardTitle>
        <CardDescription>
          Describe your issue and we'll help you resolve it quickly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select value={category} onValueChange={setCategory} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select 
              value={priority} 
              onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Please provide a detailed description of your issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-foreground">
                    Click to upload files
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    PNG, JPG, PDF up to 10MB
                  </span>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  disabled={isSubmitting}
                />
              </div>
            </div>
            
            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files:</Label>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm truncate">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Ticket...' : 'Create Ticket'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateTicketForm;
