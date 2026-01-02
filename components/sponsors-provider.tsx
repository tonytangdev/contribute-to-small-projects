import { prisma } from "@/lib/db";
import SponsorsProviderClient from "./sponsors-provider-client";

async function getActiveSponsors() {
  try {
    const now = new Date();
    const dbSponsors = await prisma.sponsor.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { priority: "desc" },
    });

    return dbSponsors.map((sponsor) => ({
      ...sponsor,
      startDate: sponsor.startDate.toISOString(),
      endDate: sponsor.endDate.toISOString(),
      createdAt: sponsor.createdAt.toISOString(),
      updatedAt: sponsor.updatedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    return [];
  }
}

async function getSponsorStats() {
  try {
    const now = new Date();
    const activeCount = await prisma.sponsor.count({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });
    return {
      activeCount,
      availableSpots: 10 - activeCount,
      maxSpots: 10,
    };
  } catch (error) {
    console.error("Error fetching sponsor stats:", error);
    return {
      activeCount: 0,
      availableSpots: 10,
      maxSpots: 10,
    };
  }
}

export default async function SponsorsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const sponsors = await getActiveSponsors();
  const stats = await getSponsorStats();

  return (
    <SponsorsProviderClient sponsors={sponsors} stats={stats}>
      {children}
    </SponsorsProviderClient>
  );
}
