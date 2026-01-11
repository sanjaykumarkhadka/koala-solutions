import { PrismaClient, Plan, UserRole, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create a demo tenant
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-agency' },
    update: {},
    create: {
      name: 'Demo Migration Agency',
      slug: 'demo-agency',
      plan: Plan.PROFESSIONAL,
      settings: {
        create: {
          primaryColor: '#0ea5e9',
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
        },
      },
    },
  });

  console.log('Created demo tenant:', demoTenant.slug);

  // Create admin user
  const passwordHash = await bcrypt.hash('password123', 10);

  const adminUser = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: demoTenant.id,
        email: 'admin@demo.com',
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      email: 'admin@demo.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create an agent user
  const agentUser = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: demoTenant.id,
        email: 'agent@demo.com',
      },
    },
    update: {},
    create: {
      tenantId: demoTenant.id,
      email: 'agent@demo.com',
      passwordHash,
      firstName: 'John',
      lastName: 'Agent',
      role: UserRole.AGENT,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Created agent user:', agentUser.email);

  // Create a sample company
  const sampleCompany = await prisma.company.upsert({
    where: { id: 'sample-company-id' },
    update: {},
    create: {
      id: 'sample-company-id',
      tenantId: demoTenant.id,
      name: 'Tech Corp International',
      industry: 'Technology',
      website: 'https://techcorp.example.com',
      contactEmail: 'hr@techcorp.example.com',
      country: 'United States',
    },
  });

  console.log('Created sample company:', sampleCompany.name);

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
