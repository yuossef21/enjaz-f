import bcrypt from 'bcrypt';
import { supabase } from '../config/database.js';
import { User } from '../models/types.js';

export const usersService = {
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, permissions, is_active, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getUserById(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, role, permissions, is_active, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createUser(userData: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    permissions?: string[];
  }) {
    const passwordHash = await bcrypt.hash(userData.password, 10);

    // Default permissions based on role
    let defaultPermissions = userData.permissions;
    if (!defaultPermissions) {
      if (userData.role === 'admin') {
        defaultPermissions = ['*'];
      } else if (userData.role === 'promoter') {
        defaultPermissions = [
          'leads:view',
          'leads:create',
          'leads:edit',
          'customers:view',
          'customers:create',
          'customers:edit',
          'attendance:view',
          'attendance:checkin',
        ];
      } else if (userData.role === 'quality') {
        defaultPermissions = [
          'leads:view',
          'leads:view_all',
          'leads:approve',
          'customers:view',
          'customers:view_all',
        ];
      } else {
        defaultPermissions = [];
      }
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        password_hash: passwordHash,
        full_name: userData.full_name,
        role: userData.role,
        permissions: defaultPermissions,
      })
      .select('id, email, full_name, role, permissions, is_active, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateUser(id: string, updates: Partial<User>) {
    const allowedUpdates: any = {};

    if (updates.full_name) allowedUpdates.full_name = updates.full_name;
    if (updates.role) allowedUpdates.role = updates.role;
    if (updates.permissions) allowedUpdates.permissions = updates.permissions;
    if (typeof updates.is_active === 'boolean') allowedUpdates.is_active = updates.is_active;

    allowedUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(allowedUpdates)
      .eq('id', id)
      .select('id, email, full_name, role, permissions, is_active, created_at, updated_at')
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async deleteUser(id: string) {
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },

  async resetPassword(id: string, newPassword: string) {
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};
