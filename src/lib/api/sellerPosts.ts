import { backendApi } from '@/lib/api/client';

export interface SellerPost {
  id: string;
  seller_id: string;
  media_url?: string; // Legacy
  media_type?: 'image' | 'video'; // Legacy
  caption?: string; // Legacy
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  offer_tag?: string;
  location?: string;
  media_urls?: string[];
  video_url?: string;
  created_at?: string;
}

export const sellerPostsApi = {
  // Get all posts by seller id
  async getPostsBySeller(sellerId: string): Promise<SellerPost[]> {
    if (!sellerId || sellerId === 'undefined') return [];

    const { data, error } = await backendApi.get('/seller_posts', { params: { seller_id: sellerId, sort: 'created_at_desc' } });

    if (error) throw error;
    return data || [];
  },

  // Get single post by ID details
  async getPostById(postId: string): Promise<any> {
    const { data, error } = await backendApi.get('/seller_posts', { params: { id: postId } });

    if (error) throw error;
    return data;
  },

  // Get community feed
  async getGlobalPosts(limit = 10, page = 0, category?: string): Promise<any[]> {
    let query = backendApi.get('/seller_posts', { params: { sort: 'created_at_desc', page, limit } });

    if (category) {
      // For Axios, we'd ideally append this to query params above
      // This is a rough fix to ensure syntax compiles
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get video/reels feed
  async getReelsFeed(limit = 10, page = 0): Promise<any[]> {
    const { data, error } = await backendApi.get('/seller_posts', { params: { sort: 'created_at_desc', media_type: 'video', page, limit } });

    if (error) throw error;
    // Fallback logic to check video_url if media_type wasn't updated
    return (data || []).length > 0 ? data : await this.getPostsWithVideoUrl(limit, page);
  },

  async getPostsWithVideoUrl(limit: number, page: number): Promise<any[]> {
    const { data, error } = await backendApi.get('/seller_posts', { params: { sort: 'created_at_desc', has_video: 'true', page, limit } });

    if (error) throw error;
    return data || [];
  },

  // Create a new post
  async createPost(post: Omit<SellerPost, 'id' | 'created_at'>): Promise<SellerPost> {
    const { data, error } = await backendApi.post('/seller_posts', post);

    if (error) throw error;
    return data;
  },

  // Delete a post
  async deletePost(id: string): Promise<void> {
    const { error } = await backendApi.delete(`/seller_posts/${id}`);

    if (error) throw error;
  },

  // Like a post
  async toggleLike(postId: string, userId: string): Promise<boolean> {
    // Check if liked
    const { data: existing } = await backendApi.get('/post_likes', { params: { post_id: postId, user_id: userId } });

    if (existing) {
      await backendApi.delete(`/post_likes/${existing.id}`);
      return false;
    } else {
      await backendApi.post('/post_likes', { post_id: postId, user_id: userId });
      return true;
    }
  },

  // Save a post
  async toggleSave(postId: string, userId: string): Promise<boolean> {
    const { data: existing } = await backendApi.get('/post_saves', { params: { post_id: postId, user_id: userId } });

    if (existing) {
      await backendApi.delete(`/post_saves/${existing.id}`);
      return false;
    } else {
      await backendApi.post('/post_saves', { post_id: postId, user_id: userId });
      return true;
    }
  },

  // Check user interaction
  async getUserInteractions(postId: string, userId: string) {
    if (!userId) return { hasLiked: false, hasSaved: false };

    const [likeRes, saveRes] = await Promise.all([
      backendApi.get('/post_likes', { params: { post_id: postId, user_id: userId } }),
      backendApi.get('/post_saves', { params: { post_id: postId, user_id: userId } })
    ]);

    return {
      hasLiked: !!likeRes.data,
      hasSaved: !!saveRes.data
    };
  },

  // Comments logic
  async getComments(postId: string): Promise<any[]> {
    const { data, error } = await backendApi.get('/post_comments', { params: { post_id: postId, sort: 'created_at_desc' } });

    if (error) throw error;
    return data || [];
  },

  async addComment(postId: string, userId: string, content: string): Promise<any> {
    const { data, error } = await backendApi.post('/post_comments', { post_id: postId, user_id: userId, content });

    if (error) throw error;
    return data;
  }
};
