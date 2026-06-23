import { describe, expect, it } from 'vitest';
import { escapeHtml, generateFollowUpEmail } from './gmail';

describe('Gmail follow-up templates', () => {
    it('escapes untrusted HTML values', () => {
        expect(escapeHtml(`<script>alert('x')</script>`)).toBe('&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;');

        const message = generateFollowUpEmail({
            stage: 1,
            clientName: '<img src=x onerror=alert(1)>',
            invoiceNumber: 'INV-1\r\nBcc: attacker@example.com',
            amount: '<strong>100</strong>',
            dueDate: '2026-07-01',
            senderName: '<Flowcent>',
            paymentUrl: 'javascript:alert(1)',
        });

        expect(message.html).toContain('&lt;img src=x onerror=alert(1)&gt;');
        expect(message.html).not.toContain('<img src=x');
        expect(message.html).not.toContain('javascript:');
        expect(message.subject).not.toContain('\r');
        expect(message.subject).not.toContain('\n');
    });
});
