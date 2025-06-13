import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Tag } from '@/types/ticketing';
import { useToast } from '@/hooks/use-toast';

export const useTags = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchTags = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name');

      if (error) throw error;

      setTags(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (name: string, color: string = '#6B7280') => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({ name, color })
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
      setError(err instanceof Error ? err.message : 'An error occurred');
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateTag = async (id: string, updates: Partial<Tag>) => {
    try {
      const { data, error } = await supabase
        .from('tags')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTags(prev => prev.map(tag => 
        tag.id === id ? { ...tag, ...data } : tag
      ));

      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteTag = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTags(prev => prev.filter(tag => tag.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const addTagToTicket = async (ticketId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('ticket_tags')
        .insert({ ticket_id: ticketId, tag_id: tagId });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const removeTagFromTicket = async (ticketId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from('ticket_tags')
        .delete()
        .match({ ticket_id: ticketId, tag_id: tagId });

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return {
    tags,
    loading,
    error,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    addTagToTicket,
    removeTagFromTicket,
  };
};
