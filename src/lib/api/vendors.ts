import { supabase } from '../supabase';

export interface VendorInput {
  user_id: string;
  shop_name: string;
  description?: string;
  address?: string;
  phone?: string;
  market_id?: string;
}

export const vendorsApi = {
  // Register a new vendor profile
  async registerVendor(vendor: VendorInput) {
    const { data, error } = await supabase
      .from('vendors')
      .insert([vendor])
      .select()
      .single();
      
    if (error) throw error;
    return data;
  },

  // Get vendor profile by user ID
  async getVendorProfile(userId: string) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*, markets(id, name, slug)')
      .eq('user_id', userId)
      .maybeSingle(); // Use maybeSingle to avoid 406 if row doesn't exist yet
      
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },
  
  // Get vendor by ID
  async getVendorById(id: string) {
    const { data, error } = await supabase
      .from('vendors')
      .select('*, markets(id, name, slug)')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  }
};
