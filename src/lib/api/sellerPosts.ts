import { supabase } from '../supabase';

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

    const { data, error } = await supabase
      .from('seller_posts')
      .select(`
        *,
        post_likes (count),
        post_saves (count)
      `)
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single post by ID details
  async getPostById(postId: string): Promise<any> {
    const { data, error } = await supabase
      .from('seller_posts')
      .select(`
        *,
        shops!shop_id (
          id,
          name,
          location,
          image_url
        ),
        post_likes (count),
        post_saves (count),
        post_comments (count)
      `)
      .eq('id', postId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Get community feed
  async getGlobalPosts(limit = 10, page = 0, category?: string): Promise<any[]> {
    let query = supabase
      .from('seller_posts')
      .select(`
        *,
        shops!shop_id (
          id,
          name,
          location,
          image_url
        ),
        post_likes (count),
        post_saves (count),
        post_comments (count)
      `)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  // Get video/reels feed
  async getReelsFeed(limit = 10, page = 0): Promise<any[]> {
    const { data, error } = await supabase
      .from('seller_posts')
      .select(`
        *,
        shops!shop_id (
          id,
          name,
          location,
          image_url
        ),
        post_likes (count),
        post_saves (count)
      `)
      .filter('media_type', 'eq', 'video')
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    // Fallback logic to check video_url if media_type wasn't updated
    return (data || []).length > 0 ? data : await this.getPostsWithVideoUrl(limit, page);
  },

  async getPostsWithVideoUrl(limit: number, page: number): Promise<any[]> {
    const { data, error } = await supabase
      .from('seller_posts')
      .select(`*, shops(id, name, location, image_url), post_likes(count), post_saves(count)`)
      .not('video_url', 'is', null)
      .order('created_at', { ascending: false })
      .range(page * limit, (page + 1) * limit - 1);

    if (error) throw error;
    return data || [];
  },

  // Create a new post
  async createPost(post: Omit<SellerPost, 'id' | 'created_at'>): Promise<SellerPost> {
    const { data, error } = await supabase
      .from('seller_posts')
      .insert([post])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete a post
  async deletePost(id: string): Promise<void> {
    const { error } = await supabase
      .from('seller_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Like a post
  async toggleLike(postId: string, userId: string): Promise<boolean> {
    // Check if liked
    const { data: existing } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase.from('post_likes').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('post_likes').insert([{ post_id: postId, user_id: userId }]);
      return true;
    }
  },

  // Save a post
  async toggleSave(postId: string, userId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('post_saves')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      await supabase.from('post_saves').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('post_saves').insert([{ post_id: postId, user_id: userId }]);
      return true;
    }
  },

  // Check user interaction
  async getUserInteractions(postId: string, userId: string) {
    if (!userId) return { hasLiked: false, hasSaved: false };

    const [likeRes, saveRes] = await Promise.all([
      supabase.from('post_likes').select('id').eq('post_id', postId).eq('user_id', userId).maybeSingle(),
      supabase.from('post_saves').select('id').eq('post_id', postId).eq('user_id', userId).maybeSingle()
    ]);

    return {
      hasLiked: !!likeRes.data,
      hasSaved: !!saveRes.data
    };
  },

  // Comments logic
  async getComments(postId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles (
          id,
          name,
          role
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async addComment(postId: string, userId: string, content: string): Promise<any> {
    const { data, error } = await supabase
      .from('post_comments')
      .insert([{
        post_id: postId,
        user_id: userId,
        content: content
      }])
      .select(`
        *,
        profiles (
          id,
          name,
          role
        )
      `)
      .single();

    if (error) throw error;
    return data;
  }
};
