import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create 5 unique admin users with different roles
  const adminUsers = [
    {
      email: 'orion.ops@rsc-chain.com',
      password: 'admin123',
      firstName: 'Orion',
      lastName: 'Operations',
      role: 'SUPER_ADMIN' as const,
      permissions: ['*'],
      department: 'Executive Operations'
    },
    {
      email: 'nova.ops@rsc-chain.com',
      password: 'nova2024',
      firstName: 'Nova',
      lastName: 'Analytics',
      role: 'OPS_LEAD' as const,
      permissions: ['users:read', 'users:write', 'follow_bonus:*', 'events:*', 'audit:read'],
      department: 'Operations Lead'
    },
    {
      email: 'centauri.ops@rsc-chain.com',
      password: 'centauri2024',
      firstName: 'Centauri',
      lastName: 'Review',
      role: 'ANALYST' as const,
      permissions: ['users:read', 'follow_bonus:read', 'follow_bonus:write', 'events:read', 'audit:read'],
      department: 'Manual Review Team'
    },
    {
      email: 'lyra.ops@rsc-chain.com',
      password: 'lyra2024',
      firstName: 'Lyra',
      lastName: 'Compliance',
      role: 'AUDITOR' as const,
      permissions: ['audit:read'],
      department: 'Compliance & Audit'
    },
    {
      email: 'phoenix.ops@rsc-chain.com',
      password: 'phoenix2024',
      firstName: 'Phoenix',
      lastName: 'Support',
      role: 'VIEWER' as const,
      permissions: ['users:read', 'follow_bonus:read', 'events:read', 'audit:read'],
      department: 'Technical Support'
    }
  ];

  console.log('👥 Creating 5 unique admin accounts...');

  for (const userData of adminUsers) {
    const passwordHash = await bcrypt.hash(userData.password, 12);

    const admin = await prisma.adminUser.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        permissions: userData.permissions,
        isActive: true,
      },
    });

    console.log(`✅ ${userData.role} account created:`, {
      email: admin.email,
      role: admin.role,
      department: userData.department
    });
  }

  // Create some sample follow bonus requests
  const sampleRequests = [
    {
      fullName: 'Alice Johnson',
      contactEmail: 'alice@example.com',
      xHandle: '@alice_crypto',
      telegramUsername: 'alice_tg',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      amount: 100,
      status: 'PENDING',
    },
    {
      fullName: 'Bob Smith',
      contactEmail: 'bob@example.com',
      xHandle: '@bob_blockchain',
      telegramUsername: 'bob_tg',
      walletAddress: '0x8ba1f109551bD432803012645ac136ddd64DBA72',
      amount: 100,
      status: 'PENDING',
    },
    {
      fullName: 'Carol Williams',
      contactEmail: 'carol@example.com',
      xHandle: '@carol_web3',
      telegramUsername: 'carol_tg',
      walletAddress: '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
      amount: 100,
      status: 'APPROVED',
      reviewedBy: admin.id,
      reviewedAt: new Date(),
      reviewNotes: 'Verified social media presence and wallet ownership.',
    },
  ];

  for (const request of sampleRequests) {
    await prisma.followBonusRequest.create({
      data: request,
    });
  }

  console.log('✅ Sample follow bonus requests created');

  console.log('🎉 Database seeded successfully');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
