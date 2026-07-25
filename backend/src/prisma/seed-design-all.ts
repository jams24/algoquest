import { PrismaClient } from '@prisma/client';
import { seedTracks1and2 } from './seed-design-tracks-1-2';
import { seedTracks3and4 } from './seed-design-tracks-3-4';
import { seedTracks5and6 } from './seed-design-tracks-5-6';
import { seedTracks7and8 } from './seed-design-tracks-7-8';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding all System Design tracks...');

  await seedTracks1and2();
  await seedTracks3and4();
  await seedTracks5and6();
  await seedTracks7and8();

  const trackCount = await prisma.designTrack.count();
  const lessonCount = await prisma.designLesson.count();

  console.log(`\n✅ Done! ${trackCount} tracks, ${lessonCount} lessons seeded.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
