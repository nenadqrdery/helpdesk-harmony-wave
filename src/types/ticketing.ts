
export interface Profile {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'agent';
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_by?: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  filename: string;
  file_path: string;
  file_size?: number;
  content_type?: string;
  uploaded_by: string;
  created_at: string;
  ticket_id?: string;
  comment_id?: string;
}

export interface Comment {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  internal: boolean;
  created_at: string;
  author?: User;
  attachments?: Attachment[];
}

export interface TicketActivity {
  id: string;
  ticket_id: string;
  user_id: string;
  action_type: string;
  old_value?: string;
  new_value?: string;
  description?: string;
  created_at: string;
  user?: User;
}

export interface TicketRating {
  id: string;
  ticket_id: string;
  user_id: string;
  rating: number;
  feedback?: string;
  created_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'new' | 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  due_date?: string;
  assigned_agent_id?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  assigned_agent?: User;
  tags: Tag[];
  comments: Comment[];
  attachments: Attachment[];
  activities: TicketActivity[];
  rating?: TicketRating | null;
}

export interface TicketFilters {
  status?: string[];
  priority?: string[];
  assigned_agent?: string[];
  search?: string;
  tags?: string[];
}

export interface SavedReply {
  id: string;
  title: string;
  content: string;
  created_by: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  ticket_id?: string;
  type: string;
  title: string;
  message?: string;
  read: boolean;
  created_at: string;
}
