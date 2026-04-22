import bcrypt from 'bcrypt';
import { supabase } from '../config/database.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { User } from '../models/types.js';

export const authService = {
  async login(email: string, password: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: user.permissions || [],
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        permissions: user.permissions,
      },
    };
  },

  async createUser(userData: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    permissions?: string[];
  }) {
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const { data, error } = await supabase
      .from('users')
      .insert({
        email: userData.email,
        password_hash: passwordHash,
        full_name: userData.full_name,
        role: userData.role,
        permissions: userData.permissions || [],
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};
