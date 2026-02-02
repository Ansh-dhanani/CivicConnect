import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Cleanup existing data
  // We use a transaction to ensure all deletes succeed or fail together, preventing partial wipes
  await prisma.$transaction([
    prisma.complaintImage.deleteMany(),
    prisma.potholeImage.deleteMany(),
    prisma.complaintUpvote.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.complaint.deleteMany(),
    prisma.potholes.deleteMany(),
    prisma.wardStatistic.deleteMany(), // Added before deleting Ward
    prisma.ward.deleteMany(),
    prisma.repairTeam.deleteMany(),
    prisma.user.deleteMany(),
  ]);
  
  // Create Admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@civicconnect.gov';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';
  
  // Fail fast in non-dev environments if credentials are missing
  if (process.env.NODE_ENV === 'production' && (!process.env.SEED_ADMIN_EMAIL || !process.env.SEED_ADMIN_PASSWORD)) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required in production');
  }

  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedAdminPassword,
      full_name: 'System Administrator',
      phone: '+91-9876543210',
      role: 'admin',
      is_active: true,
      is_email_verified: true,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // Create Citizen
  const citizenEmail = process.env.SEED_CITIZEN_EMAIL || 'citizen1@example.com';
  const citizenPassword = process.env.SEED_CITIZEN_PASSWORD || 'Citizen@123';
  const hashedCitizenPassword = await bcrypt.hash(citizenPassword, 10);
  
  const citizen = await prisma.user.create({
    data: {
      email: citizenEmail,
      password: hashedCitizenPassword,
      full_name: 'Amit Patel',
      phone: '+91-9123456789',
      role: 'citizen',
      is_active: true,
      is_email_verified: true,
    },
  });
  console.log(`Created citizen: ${citizen.email}`);

  // Create Wards
  await prisma.ward.createMany({
    data: [
        { ward_number: 'A', ward_name: 'Colaba' },
        { ward_number: 'B', ward_name: 'Sandhurst Road' },
        { ward_number: 'C', ward_name: 'Marine Lines' },
        { ward_number: 'D', ward_name: 'Grant Road' },
    ]
  });
  console.log('Created wards');

  // Create Repair Teams
  await prisma.repairTeam.createMany({
    data: [
        { team_code: 'TEAM-A', team_name: 'Alpha Team' },
        { team_code: 'TEAM-B', team_name: 'Beta Team' },
    ]
  });
  console.log('Created repair teams');

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
