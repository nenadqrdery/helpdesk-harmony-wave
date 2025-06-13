
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Comment } from '@/types/ticketing';
import { useToast } from '@/hooks/use-toast';

export const useComments = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const addComment = async (ticketId: string, content: string, internal: boolean = false, attachments?: File[]) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          ticket_id: ticketId,
          author_id: user.id,
          content,
          internal
        })
        .select()
        .single();

      if (error) throw error;

      // Handle file uploads if any
      if (attachments && attachments.length > 0) {
        await uploadAttachments(attachments, ticketId, comment.id);
      }

      toast({
        title: "Success",
        description: internal ? "Internal note added" : "Message sent"
      });

      return comment;
    } catch (err) {
      console.error('Error adding comment:', err);
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive"
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const uploadAttachments = async (files: File[], ticketId: string, commentId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const uploadPromises = files.map(async (file) => {
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase
          .from('attachments')
          .insert({
            ticket_id: ticketId,
            comment_id: commentId,
            filename: file.name,
            file_path: uploadData.path,
            file_size: file.size,
            content_type: file.type,
            uploaded_by: user.id
          });

        if (dbError) throw dbError;
      });

      await Promise.all(uploadPromises);
    } catch (err) {
      console.error('Error uploading attachments:', err);
      throw err;
    }
  };

  return {
    addComment,
    uploadAttachments,
    loading
  };
};
