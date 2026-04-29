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
  // Create ticket from public form (supports FormData for files)
  async createPublic(data: any): Promise<{ success: boolean; data?: Ticket; error?: string }> {
    try {
      const isFormData = data instanceof FormData || (data && data.constructor && data.constructor.name === 'FormData');
      const headers: any = {};
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }


      const response = await fetch(`${this.baseUrl}${this.endpoint}/public`, {
        method: 'POST',
        headers,
        body: isFormData ? data : JSON.stringify(data),
      });
      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Error creating public ticket:', error);
      return { success: false, error: error.message };
    }
  }


  // Get all tickets (authenticated) with pagination
  async getAll(filters?: { status?: string; priority?: string; category?: string; assignedTo?: string; page?: number; limit?: number }): Promise<{ success: boolean; data: Ticket[]; pagination: any }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.assignedTo) params.append('assignedTo', filters.assignedTo);
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`${this.baseUrl}${this.endpoint}${params.toString() ? '?' + params.toString() : ''}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const result = await response.json();
      return result;
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
  async addComment(id: string, text: string | FormData, isInternal: boolean = false): Promise<TicketComment> {
    try {
      const isFormData = text instanceof FormData;
      const headers: any = {};
      
      const token = localStorage.getItem('token');
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      if (!isFormData) {
        headers['Content-Type'] = 'application/json';
      }

      let body;
      if (isFormData) {
        body = text;
      } else {
        body = JSON.stringify({ text, isInternal });
      }

      const response = await fetch(`${this.baseUrl}${this.endpoint}/${id}/comments`, {
        method: 'POST',
        headers,
        body
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || 'No se pudo agregar el comentario');
      return result.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw new Error('Error al agregar el comentario');
    }
  }

  // Get ticket history for client with pagination
  async getClientHistory(page = 1, limit = 12): Promise<{ success: boolean; data: Ticket[]; pagination: any }> {
    try {
      const response = await fetch(`${this.baseUrl}${this.endpoint}/client-history?page=${page}&limit=${limit}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching ticket history:', error);
      throw new Error('No se pudo cargar el historial de tickets');
    }
  }
}

export const ticketService = new TicketService();
