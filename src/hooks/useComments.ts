import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Comment, Attachment } from '@/types/ticketing';

export const useComments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addComment = async (
    ticketId: string,
    content: string,
    internal: boolean = false,
    files: File[] = []
  ) => {
    try {
      setLoading(true);

      // Upload attachments if any
      const attachments: Attachment[] = [];
      if (files.length > 0) {
        for (const file of files) {
          const filePath = `tickets/${ticketId}/attachments/${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('attachments')
            .getPublicUrl(filePath);

          attachments.push({
            id: uploadData.path,
            name: file.name,
            url: urlData.publicUrl,
            size: file.size,
            type: file.type,
            created_at: new Date().toISOString(),
          });
        }
      }

      // Create the comment
      const { data: comment, error: commentError } = await supabase
        .from('ticket_comments')
        .insert({
          ticket_id: ticketId,
          content,
          internal,
          attachments,
        })
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (commentError) throw commentError;

      return comment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (commentId: string, updates: Partial<Comment>) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('ticket_comments')
        .update(updates)
        .eq('id', commentId)
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('ticket_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
  };
};
