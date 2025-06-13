
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tag } from '@/types/ticketing';
import { useToast } from '@/hooks/use-toast';

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTags = async () => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (err) {
      console.error('Error fetching tags:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (name: string, color: string = '#3b82f6') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tags')
        .insert({
          name,
          color,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      setTags(prev => [...prev, data]);
      toast({
        title: "Success",
        description: "Tag created successfully"
      });

      return data;
    } catch (err) {
      console.error('Error creating tag:', err);
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive"
      });
      throw err;
    }
  };

  const addTagToTicket = async (ticketId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('ticket_tags')
        .insert({
          ticket_id: ticketId,
          tag_id: tagId
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error adding tag to ticket:', err);
      throw err;
    }
  };

  const removeTagFromTicket = async (ticketId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('ticket_tags')
        .delete()
        .eq('ticket_id', ticketId)
        .eq('tag_id', tagId);

      if (error) throw error;
    } catch (err) {
      console.error('Error removing tag from ticket:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    createTag,
    addTagToTicket,
    removeTagFromTicket,
    refetch: fetchTags
  };
};
