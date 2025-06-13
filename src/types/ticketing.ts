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
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
}

export interface Comment {
  id: string;
  ticket_id: string;
  user_id: string;
  user?: User;
  content: string;
  internal: boolean;
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
}

export interface TicketActivity {
  id: string;
  ticket_id: string;
  user_id: string;
  user?: User;
  action: string;
  details: Record<string, any>;
  created_at: string;
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
  subject: string;
  description: string;
  status: 'new' | 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  user_id: string;
  user?: User;
  assigned_agent_id?: string;
  assigned_agent?: User;
  tags: Tag[];
  comments: Comment[];
  activities: TicketActivity[];
  attachments: Attachment[];
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TicketFilters {
  search?: string;
  status?: string[];
  priority?: string[];
  assigned_to?: string[];
  tags?: string[];
  date_range?: {
    start: string;
    end: string;
  };
}

export interface SavedReply {
  id: string;
  title: string;
  content: string;
  created_by: string;
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
