import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = Buffer.from(process.env.GITHUB_TOKEN_ENCRYPTION_KEY || '', 'hex');

if (ENCRYPTION_KEY.length !== 32) {
  console.warn('WARNING: GITHUB_TOKEN_ENCRYPTION_KEY is not set or invalid. GitHub token encryption will not work properly.');
  console.warn('Generate a key with: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"');
}

export function encryptToken(token: string): string {
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY must be a 32-byte hex string (64 characters)');
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptToken(encryptedToken: string): string {
  if (ENCRYPTION_KEY.length !== 32) {
    throw new Error('GITHUB_TOKEN_ENCRYPTION_KEY must be a 32-byte hex string (64 characters)');
  }

  const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');

  if (!ivHex || !authTagHex || !encrypted) {
    throw new Error('Invalid encrypted token format');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
