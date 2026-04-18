import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface AwardedAchievement {
  name: string;
  description: string;
  icon: string;
}

export async function checkAndAwardAchievements(userId: string): Promise<AwardedAchievement[]> {
  const awarded: AwardedAchievement[] = [];

  const [user, completedCount, topicsCompleted, existingAchievements] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.userProgress.count({ where: { userId, status: 'COMPLETED' } }),
    getCompletedTopicCount(userId),
    prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true }
    })
  ]);

  if (!user) return awarded;

  const earnedIds = new Set(existingAchievements.map(a => a.achievementId));
  const allAchievements = await prisma.achievement.findMany();

  for (const achievement of allAchievements) {
    if (earnedIds.has(achievement.id)) continue;

    const criteria = achievement.criteria as { type: string; count?: number };
    let earned = false;

    switch (criteria.type) {
      case 'problems_completed':
        earned = completedCount >= (criteria.count ?? 1);
        break;
      case 'streak_days':
        earned = user.streak >= (criteria.count ?? 7);
        break;
      case 'topics_completed':
        earned = topicsCompleted >= (criteria.count ?? 1);
        break;
      case 'level_reached':
        earned = user.level >= (criteria.count ?? 1);
        break;
    }

    if (earned) {
      await prisma.userAchievement.create({
        data: { userId, achievementId: achievement.id }
      });
      awarded.push({
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon
      });
    }
  }

  return awarded;
}

async function getCompletedTopicCount(userId: string): Promise<number> {
  const topics = await prisma.topic.findMany({
    include: {
      problems: { select: { id: true } }
    }
  });

  const completed = await prisma.userProgress.findMany({
    where: { userId, status: 'COMPLETED' },
    select: { problemId: true }
  });
  const completedSet = new Set(completed.map(p => p.problemId));

  return topics.filter(t =>
    t.problems.length > 0 && t.problems.every(p => completedSet.has(p.id))
  ).length;
}
