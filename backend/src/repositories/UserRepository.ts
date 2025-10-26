import pool from '../config/database';

export interface User {
  id: number;
  google_id: string | null;
  email: string;
  display_name: string;
  profile_picture: string | null;
  password_hash: string | null;
  email_verified: boolean;
  verification_token: string | null;
  verification_token_expires: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserParams {
  google_id?: string;
  email: string;
  display_name: string;
  profile_picture?: string;
  password_hash?: string;
  email_verified?: boolean;
  verification_token?: string;
  verification_token_expires?: Date;
}

export const findByGoogleId = async (googleId: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
  return result.rows.length === 0 ? null : result.rows[0];
};

export const findByEmail = async (email: string): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows.length === 0 ? null : result.rows[0];
};

export const findById = async (id: number): Promise<User | null> => {
  const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows.length === 0 ? null : result.rows[0];
};

export const findByVerificationToken = async (token: string): Promise<User | null> => {
  const result = await pool.query(
    'SELECT * FROM users WHERE verification_token = $1 AND verification_token_expires > NOW()',
    [token]
  );
  return result.rows.length === 0 ? null : result.rows[0];
};

export const createUser = async (params: CreateUserParams): Promise<User> => {
  const result = await pool.query(
    `INSERT INTO users (
      google_id, email, display_name, profile_picture,
      password_hash, email_verified, verification_token, verification_token_expires
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [
      params.google_id || null,
      params.email,
      params.display_name,
      params.profile_picture || null,
      params.password_hash || null,
      params.email_verified || false,
      params.verification_token || null,
      params.verification_token_expires || null
    ]
  );
  return result.rows[0];
};

export const markEmailAsVerified = async (userId: number): Promise<User> => {
  const result = await pool.query(
    `UPDATE users
     SET email_verified = TRUE,
         verification_token = NULL,
         verification_token_expires = NULL,
         updated_at = NOW()
     WHERE id = $1 RETURNING *`,
    [userId]
  );
  return result.rows[0];
};

export const linkGoogleAccount = async (userId: number, googleId: string, profilePicture?: string): Promise<User> => {
  const result = await pool.query(
    `UPDATE users
     SET google_id = $1,
         profile_picture = COALESCE($2, profile_picture),
         email_verified = TRUE,
         updated_at = NOW()
     WHERE id = $3 RETURNING *`,
    [googleId, profilePicture || null, userId]
  );
  return result.rows[0];
};
