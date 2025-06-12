
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'agent';
  created_at: string;
}

export interface Ticket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: 'new' | 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  due_date?: string;
  tags: string[];
  assigned_agent_id?: string;
  attachments: string[];
  created_at: string;
  updated_at: string;
  user?: User;
  assigned_agent?: User;
}

export interface Comment {
  id: string;
  ticket_id: string;
  author_id: string;
  content: string;
  internal: boolean;
  created_at: string;
  author?: User;
}

export interface TicketFilters {
  status?: string;
  priority?: string;
  assigned_agent?: string;
  search?: string;
  tags?: string[];
}
