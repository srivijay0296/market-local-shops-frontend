import client from './client';

export const adminApi = {
  async getStats() {
    const res = await client.get('/admin/stats');
    return res.data;
  },

  async getUsers() {
    const res = await client.get('/admin/users');
    return res.data;
  },

  async updateUserStatus(id: string, is_approved: boolean) {
    const res = await client.put(`/admin/users/${id}`, { is_approved });
    return res.data;
  }
};
