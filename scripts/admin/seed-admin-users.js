#!/usr/bin/env node
/*
 * Seed five RSC Chain admin accounts into Supabase auth.
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/admin/seed-admin-users.js
 */

import fetch from 'node-fetch';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.');
    process.exit(1);
}

const admins = [
    { email: 'orion.ops@rsc-chain.com', password: generatePassword('Orion'), fullName: 'Orion Operations' },
    { email: 'nova.ops@rsc-chain.com', password: generatePassword('Nova'), fullName: 'Nova Operations' },
    { email: 'centauri.ops@rsc-chain.com', password: generatePassword('Centauri'), fullName: 'Centauri Operations' },
    { email: 'lyra.ops@rsc-chain.com', password: generatePassword('Lyra'), fullName: 'Lyra Operations' },
    { email: 'phoenix.ops@rsc-chain.com', password: generatePassword('Phoenix'), fullName: 'Phoenix Operations' }
];

async function main() {
    console.log('Creating admin accounts...');

    for (const admin of admins) {
        await createUser(admin);
    }

    console.log('\nAdmin accounts provisioned. Share credentials securely:');
    console.table(admins.map(({ email, password }) => ({ email, password })));
}

function generatePassword(prefix) {
    const random = crypto.randomBytes(4).toString('hex');
    return `${prefix}!${random}`;
}

async function createUser({ email, password, fullName }) {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: fullName,
                roles: ['admin', 'follow_bonus'],
                created_by: 'seed-script'
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to create ${email}: ${errorText}`);
        return;
    }

    console.log(`Created admin user: ${email}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});


