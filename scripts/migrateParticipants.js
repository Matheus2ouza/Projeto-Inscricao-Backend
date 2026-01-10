const { PrismaClient } = require('../generated/prisma');

const prisma = new PrismaClient();

async function migrateParticipantsToAccountParticipants() {
  console.log('🔄 Starting migration...');

  const participants = await prisma.participant.findMany({
    include: {
      inscription: true,
    },
  });

  const data = participants
    .filter((p) => p.inscription)
    .map((p) => ({
      accountId: p.inscription.accountId,
      name: p.name,
      birthDate: p.birthDate,
      gender: p.gender,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

  if (data.length === 0) {
    console.log('⚠️ No participants to migrate.');
    return;
  }

  const result = await prisma.accountParticipant.createMany({
    data,
    skipDuplicates: true,
  });

  console.log(`✅ Migrated ${result.count} participants.`);
}

migrateParticipantsToAccountParticipants()
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
