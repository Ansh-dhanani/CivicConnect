import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding ...');

  // Cleanup existing data
  await prisma.complaintImage.deleteMany();
  await prisma.potholeImage.deleteMany();
  await prisma.complaintUpvote.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.potholes.deleteMany();
  await prisma.user.deleteMany();
  await prisma.ward.deleteMany();
  await prisma.repairTeam.deleteMany();
  
  // Create Admin
  const hashedPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@civicconnect.gov',
      password: hashedPassword,
      full_name: 'System Administrator',
      phone: '+91-9876543210',
      role: 'admin',
      is_active: true,
      is_email_verified: true,
    },
  });
  console.log(`Created admin: ${admin.email}`);

  // Create Citizen
  const citizenPassword = await bcrypt.hash('Citizen@123', 10);
  const citizen = await prisma.user.create({
    data: {
      email: 'citizen1@example.com',
      password: citizenPassword,
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
