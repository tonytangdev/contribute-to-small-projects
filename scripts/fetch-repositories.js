#!/usr/bin/env node

/**
 * Standalone repository fetcher script for VPS deployment
 * Fetches GitHub repositories and stores them in PostgreSQL database
 */

const { PrismaClient } = require("@prisma/client");

// Initialize Prisma client with better error handling
const prisma = new PrismaClient({
  errorFormat: "minimal",
  log: ["warn", "error"],
});

// GitHub API client
class GitHubClient {
  constructor(token) {
    this.token = token;
    this.baseUrl = "https://api.github.com";
  }

  async searchRepositories(
    minStars = 100,
    maxStars = 600,
    page = 1,
    sortBy = "updated",
  ) {
    try {
      const query = `stars:${minStars}..${maxStars} is:public`;
      const params = new URLSearchParams({
        q: query,
        sort: sortBy,
        order: "desc",
        per_page: "100",
        page: page.toString(),
      });

      const headers = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "contribute-to-small-projects",
      };

      if (this.token && this.token !== "your_github_token_here") {
        headers["Authorization"] = `Bearer ${this.token}`;
        console.log("Using GitHub API authentication");
      } else {
        console.log(
          "No GitHub API token provided - using unauthenticated requests",
        );
      }

      const response = await fetch(
        `${this.baseUrl}/search/repositories?${params}`,
        {
          headers,
        },
      );

      if (!response.ok) {
        throw new Error(
          `GitHub API error: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();

      // Convert GitHub repositories to our Repository format
      const repositories = data.items.map((repo) => ({
        name: repo.name,
        owner: repo.owner.login,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        contributors: null,
        githubUrl: repo.html_url,
        lastUpdated: new Date(repo.updated_at),
      }));

      return repositories;
    } catch (error) {
      console.error("Error fetching repositories from GitHub:", error);
      throw error;
    }
  }
}

async function main() {
  console.log("=== Repository Fetch Script Started ===");
  console.log(`Started at: ${new Date().toISOString()}`);

  try {
    // Test database connection before proceeding
    try {
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log("✓ Database connection verified");
    } catch (dbError) {
      console.error("✗ Database connection failed:", dbError.message);
      console.log("Retrying with fresh connection...");

      // Disconnect and reconnect
      await prisma.$disconnect();
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Test again
      await prisma.$queryRaw`SELECT 1 as test`;
      console.log("✓ Database connection successful on retry");
    }

    // Check required environment variables
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      console.error("GITHUB_TOKEN environment variable is not set");
      process.exit(1);
    }

    const githubClient = new GitHubClient(githubToken);

    console.log("Starting GitHub repository fetch...");

    // Use search strategies to get diverse repositories
    const searchStrategies = [
      { minStars: 100, maxStars: 300, sortBy: "updated" },
      { minStars: 300, maxStars: 600, sortBy: "stars" },
    ];

    console.log(
      `Fetching repositories using ${searchStrategies.length} different strategies...`,
    );
    const pagePromises = searchStrategies.map((strategy, index) => {
      console.log(
        `Strategy ${index + 1}: ${strategy.minStars}-${strategy.maxStars} stars, sorted by ${strategy.sortBy}`,
      );
      return githubClient.searchRepositories(
        strategy.minStars,
        strategy.maxStars,
        1,
        strategy.sortBy,
      );
    });

    const pageResults = await Promise.all(pagePromises);
    const allRepositories = [];

    for (let i = 0; i < pageResults.length; i++) {
      const repositories = pageResults[i];
      const strategy = searchStrategies[i];
      console.log(
        `Strategy ${i + 1} (${strategy.minStars}-${strategy.maxStars} stars, ${strategy.sortBy}): fetched ${repositories.length} repositories`,
      );
      allRepositories.push(...repositories);
    }

    console.log(
      `Fetched ${allRepositories.length} repositories from GitHub using ${searchStrategies.length} different strategies`,
    );

    // Check which repositories already exist in our database
    const existingRepos = await prisma.repository.findMany({
      where: {
        githubUrl: {
          in: allRepositories.map((repo) => repo.githubUrl),
        },
      },
      select: {
        githubUrl: true,
      },
    });

    const existingUrls = new Set(existingRepos.map((repo) => repo.githubUrl));
    const newRepositories = allRepositories.filter(
      (repo) => !existingUrls.has(repo.githubUrl),
    );
    const existingRepositories = allRepositories.filter((repo) =>
      existingUrls.has(repo.githubUrl),
    );

    console.log(
      `Found ${newRepositories.length} new repositories and ${existingRepositories.length} existing repositories`,
    );

    // Create new repositories in batches
    let actualNewCount = 0;

    if (newRepositories.length > 0) {
      console.log(
        `\n➕ Creating ${newRepositories.length} new repositories using batch insert...`,
      );
      const createStartTime = Date.now();

      // Process in smaller batches to avoid overwhelming Supabase pooler
      const batchSize = 10;
      for (let i = 0; i < newRepositories.length; i += batchSize) {
        const batch = newRepositories.slice(i, i + batchSize);

        try {
          // Prepare batch data
          const batchData = batch.map((repo) => ({
            name: repo.name,
            owner: repo.owner,
            description: repo.description,
            language: repo.language,
            stars: repo.stars,
            contributors: null,
            githubUrl: repo.githubUrl,
            lastUpdated: repo.lastUpdated,
          }));

          // Use createMany for batch inserts (much faster than individual creates)
          const result = await prisma.repository.createMany({
            data: batchData,
            skipDuplicates: true, // Skip if any already exist
          });
          actualNewCount += result.count;

          console.log(
            `Created batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(newRepositories.length / batchSize)} (${actualNewCount} total created)`,
          );

          // Small delay between batches to avoid overwhelming Supabase
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.error(
            `Failed to create batch starting at index ${i}:`,
            error,
          );
          // Try to create individually for this batch if batch fails
          for (const repo of batch) {
            try {
              await prisma.repository.create({
                data: {
                  name: repo.name,
                  owner: repo.owner,
                  description: repo.description,
                  language: repo.language,
                  stars: repo.stars,
                  contributors: null,
                  githubUrl: repo.githubUrl,
                  lastUpdated: repo.lastUpdated,
                },
              });
              actualNewCount++;
            } catch (individualError) {
              if (individualError.code === "P2002") {
                console.log(`Skipped duplicate repository: ${repo.githubUrl}`);
              } else {
                console.error(
                  `Failed to create individual repository ${repo.githubUrl}:`,
                  individualError,
                );
              }
            }
          }
        }
      }

      const createEndTime = Date.now();
      const createDuration = ((createEndTime - createStartTime) / 1000).toFixed(
        2,
      );
      console.log(
        `✅ Created ${actualNewCount} new repositories in ${createDuration}s`,
      );
    } else {
      console.log(`No new repositories to create`);
    }

    // Update existing repositories using batch operations
    if (existingRepositories.length > 0) {
      console.log(
        `\n📝 Updating ${existingRepositories.length} existing repositories using batch operations...`,
      );
      const updateStartTime = Date.now();

      // Process in smaller batches to avoid overwhelming Supabase pooler
      const batchSize = 10;
      for (let i = 0; i < existingRepositories.length; i += batchSize) {
        const batch = existingRepositories.slice(i, i + batchSize);

        try {
          // Use simple updateMany for each batch (no transaction to avoid locks)
          console.log(
            `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(existingRepositories.length / batchSize)} - updating repositories ${i + 1} to ${Math.min(i + batchSize, existingRepositories.length)}...`,
          );

          for (let j = 0; j < batch.length; j++) {
            const repo = batch[j];
            const repoIndex = i + j + 1;

            try {
              await prisma.repository.updateMany({
                where: { githubUrl: repo.githubUrl },
                data: {
                  description: repo.description,
                  language: repo.language,
                  stars: repo.stars,
                  lastUpdated: repo.lastUpdated,
                },
              });

              if (
                repoIndex % 5 === 0 ||
                repoIndex === existingRepositories.length
              ) {
                console.log(
                  `  ✓ Updated ${repoIndex}/${existingRepositories.length} repositories`,
                );
              }
            } catch (repoError) {
              console.error(
                `  ✗ Failed to update repository ${repo.githubUrl}:`,
                repoError.message,
              );
            }
          }

          console.log(
            `Updated batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(existingRepositories.length / batchSize)} (${Math.min(i + batchSize, existingRepositories.length)}/${existingRepositories.length} repositories)`,
          );

          // Small delay between batches to avoid overwhelming Supabase
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (error) {
          console.error(
            `Failed to update batch starting at index ${i}:`,
            error,
          );
          // Try to update individually for this batch if batch fails
          for (const repo of batch) {
            try {
              await prisma.repository.update({
                where: { githubUrl: repo.githubUrl },
                data: {
                  description: repo.description,
                  language: repo.language,
                  stars: repo.stars,
                  lastUpdated: repo.lastUpdated,
                },
              });
            } catch (individualError) {
              console.error(
                `Failed to update individual repository ${repo.githubUrl}:`,
                individualError,
              );
            }
          }
        }
      }

      const updateEndTime = Date.now();
      const updateDuration = ((updateEndTime - updateStartTime) / 1000).toFixed(
        2,
      );
      console.log(
        `✅ Updated ${existingRepositories.length} existing repositories in ${updateDuration}s`,
      );
    }

    console.log(`\n=== Summary ===`);
    console.log(`Total repositories processed: ${allRepositories.length}`);
    console.log(`New repositories created: ${actualNewCount}`);
    console.log(
      `Existing repositories updated: ${existingRepositories.length}`,
    );
    console.log(`Completed at: ${new Date().toISOString()}`);
  } catch (error) {
    console.error("Error in repository fetch:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
main();
