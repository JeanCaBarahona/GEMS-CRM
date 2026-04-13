import { API_CONFIG } from '../config/api';
import type { Ticket, TicketComment } from '../types/ticket';

class TicketService {
  private baseUrl = API_CONFIG.BASE_URL;
  private endpoint = '/tickets';

  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  // Create ticket from public form (no auth)
  async createPublic(data: {
    subject: string;
    description: string;
    category: string;
    priority: string;
    name: string;
    email: string;
    clientId?: string;
  }): Promise<{ success: boolean; data?: Ticket; error?: string }> {
    try {
      console.log('--- DEBUG: Sending Public Ticket ---', data);
      const response = await fetch(`${this.baseUrl}${this.endpoint}/public`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating public ticket:', error);
      throw new Error('No se pudo enviar el ticket. Reintente más tarde.');
    }
  }

  // Get all tickets (authenticated)
  async getAll(filters?: { status?: string; priority?: string; category?: string }): Promise<Ticket[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.category) params.append('category', filters.category);

      const response = await fetch(`${this.baseUrl}${this.endpoint}${params.toString() ? '?' + params.toString() : ''}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw new Error('No se pudieron cargar los tickets');
    }
  }

  // Get tickets assigned to me
  async getMyTickets(): Promise<Ticket[]> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/my`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('Error fetching my tickets:', error);
      throw new Error('No se pudieron cargar tus tickets');
    }
  }

  // Get ticket detail
  async getById(id: string): Promise<Ticket> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'Ticket no encontrado');
      return result.data;
    } catch (error) {
      console.error('Error fetching ticket detail:', error);
      throw new Error('No se pudo cargar el detalle del ticket');
    }
  }

  // Update ticket status
  async updateStatus(id: string, status: string): Promise<Ticket> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/status`, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'No se pudo actualizar el estado');
      return result.data;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw new Error('Error al actualizar el estado del ticket');
    }
  }

  // Add comment
  async addComment(id: string, text: string, isInternal: boolean = false): Promise<TicketComment> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/comments`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ text, isInternal }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'No se pudo agregar el comentario');
      return result.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Error al agregar el comentario');
    }
  }
}

export const ticketService = new TicketService();
