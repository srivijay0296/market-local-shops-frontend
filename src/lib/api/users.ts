import { backendApi } from '@/lib/api/client';
import client from './client';

export const usersApi = {
  // 🛡️ Admin User Management
  async getUsers() {
    const res = await client.get('/admin/users');
    return res.data;
  },

  async adminUpdateUser(id: string, updates: any) {
    const res = await client.put(`/admin/users/${id}`, updates);
    return res.data;
  },

  async deleteUser(id: string) {
    const res = await client.delete(`/admin/users/${id}`);
    return res.data;
  },

  async createUser(data: any) {
    const res = await client.post('/admin/users/create', data);
    return res.data;
  },

  async getStats() {
    const res = await client.get('/admin/analytics');
    return res.data;
  },

  // 👤 Non-admin profile self-update
  async updateUser(id: string, updates: { name?: string; phone?: string; address?: string }) {
    const payload: Record<string, any> = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.phone !== undefined) payload.phone = updates.phone;
    if (updates.address !== undefined) payload.address = updates.address;

    const { data, error } = await backendApi.put(`/profiles/${id}`, payload);

    if (error) throw error;
    return data;
  }
};
