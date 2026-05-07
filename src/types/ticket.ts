export interface Ticket {
  _id?: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'sales' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'open' | 'waiting' | 'resolved' | 'closed';
  submittedBy: {
    name: string;
    email: string;
    clientId?: string;
    userId?: string;
  };
  assignedTo?: string;
  assignedToUser?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    photo?: string;
  };
  tags?: string[];
  attachments?: string[];
  comments: TicketComment[];
  linkedCases?: any[];
  linkedWikiArticles?: any[];
  resolvedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketComment {
  _id?: string;
  text: string;
  author: {
    _id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  isInternal: boolean;
  createdAt: string;
}
