import api from './authService';

export interface RolePermissions {
  dashboard: boolean;
  clients: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  activities: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  reports: { view: boolean; export: boolean };
  accounting: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  cases: { view: boolean; create: boolean; edit: boolean; delete: boolean };
  team: { view: boolean; create: boolean; edit: boolean; delete: boolean };
}

export interface Role {
  _id?: string;
  name: string;
  description?: string;
  isSystem?: boolean;
  permissions: RolePermissions;
  createdAt?: string;
  updatedAt?: string;
}

export const rolesService = {
  async getAll(): Promise<Role[]> {
    const response = await api.get('/roles');
    return response.data.data;
  },

  async create(roleData: Partial<Role>): Promise<Role> {
    const response = await api.post('/roles', roleData);
    return response.data.data;
  },

  async update(id: string, roleData: Partial<Role>): Promise<Role> {
    const response = await api.put(`/roles/${id}`, roleData);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/roles/${id}`);
  }
};
