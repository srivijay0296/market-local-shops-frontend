import { backendApi } from '@/lib/api/client';

export const categoriesApi = {
  // Get all categories
  async getCategories() {
    const { data } = await backendApi.get('/categories', { params: { sort: 'name_desc' } });
    return data;
  }
};
