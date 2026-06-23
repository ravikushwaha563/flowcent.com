import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadEnvFile(filename) {
    const path = resolve(process.cwd(), filename);
    if (!existsSync(path)) return;
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
        const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (!match || process.env[match[1]]) continue;
        process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
    }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !anonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
}

const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };
const failures = [];
for (const table of ['users', 'clients', 'invoices']) {
    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=id&limit=1`, { headers });
    if (response.status === 200) failures.push(`anonymous SELECT is still allowed on ${table}`);
    else if (![401, 403].includes(response.status)) failures.push(`${table} probe returned unexpected HTTP ${response.status}`);
}

const protectedRpc = await fetch(`${supabaseUrl}/rest/v1/rpc/activate_billing_order`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ p_order_id: 'deployment-probe', p_payment_id: 'deployment-probe' }),
});
if (protectedRpc.status === 404) {
    failures.push('billing activation RPC is missing; the security migration is not applied');
} else if (![401, 403].includes(protectedRpc.status)) {
    failures.push(`billing activation RPC is reachable anonymously (HTTP ${protectedRpc.status})`);
}

if (failures.length > 0) {
    console.error('Deployment security verification failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
}

console.log('Deployment security verification passed.');
