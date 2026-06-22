import { describe, expect, it } from 'vitest';
import { decryptSecret, encryptSecret } from './secrets';

const key = Buffer.alloc(32, 7).toString('base64');

describe('secret encryption', () => {
    it('round-trips a secret without exposing plaintext', () => {
        const encrypted = encryptSecret('refresh-token-value', key);
        expect(encrypted).toMatch(/^enc:v1:/);
        expect(encrypted).not.toContain('refresh-token-value');
        expect(decryptSecret(encrypted, key)).toBe('refresh-token-value');
    });

    it('supports legacy plaintext during migration', () => {
        expect(decryptSecret('legacy-token', key)).toBe('legacy-token');
    });

    it('rejects tampered ciphertext', () => {
        const encrypted = encryptSecret('sensitive', key);
        expect(() => decryptSecret(`${encrypted.slice(0, -1)}A`, key)).toThrow();
    });
});
