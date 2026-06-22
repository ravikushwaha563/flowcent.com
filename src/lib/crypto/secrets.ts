import crypto from 'crypto';

const PREFIX = 'enc:v1';
const AAD = Buffer.from('flowcent:secret:v1');

function getKey(keyBase64 = process.env.TOKEN_ENCRYPTION_KEY): Buffer {
    if (!keyBase64) throw new Error('TOKEN_ENCRYPTION_KEY is not configured');
    const key = Buffer.from(keyBase64, 'base64');
    if (key.length !== 32) throw new Error('TOKEN_ENCRYPTION_KEY must decode to exactly 32 bytes');
    return key;
}

export function encryptSecret(value: string, keyBase64?: string): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', getKey(keyBase64), iv);
    cipher.setAAD(AAD);
    const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return [PREFIX, iv.toString('base64url'), tag.toString('base64url'), encrypted.toString('base64url')].join(':');
}

export function decryptSecret(value: string, keyBase64?: string): string {
    if (!value.startsWith(`${PREFIX}:`)) return value;

    const [, , ivEncoded, tagEncoded, encryptedEncoded] = value.split(':');
    if (!ivEncoded || !tagEncoded || !encryptedEncoded) throw new Error('Encrypted secret has an invalid format');

    const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(keyBase64), Buffer.from(ivEncoded, 'base64url'));
    decipher.setAAD(AAD);
    decipher.setAuthTag(Buffer.from(tagEncoded, 'base64url'));
    return Buffer.concat([
        decipher.update(Buffer.from(encryptedEncoded, 'base64url')),
        decipher.final(),
    ]).toString('utf8');
}
