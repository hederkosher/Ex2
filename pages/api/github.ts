import type { NextApiRequest, NextApiResponse } from "next";

// Simple in-memory cache
const cache: {
  data: any;
  timestamp: number;
} = {
  data: null,
  timestamp: 0,
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  language: string;
  created_at: string;
  updated_at: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Check cache
  const now = Date.now();
  if (cache.data && now - cache.timestamp < CACHE_DURATION) {
    return res.status(200).json(cache.data);
  }

  try {
    // Calculate date 7 days ago (more flexible than 24 hours)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const since = weekAgo.toISOString().split("T")[0];

    // Try multiple search queries to find AI/ML repositories
    const searchQueries = [
      // First: repos updated recently with AI/ML topics
      `pushed:>${since}+topic:ai+topic:machine-learning`,
      // Second: repos with AI/ML topics, sorted by stars (most popular)
      `topic:ai+topic:machine-learning`,
      // Third: repos with AI in name or description
      `ai+language:python+language:javascript`,
      // Fourth: general ML repositories
      `machine+learning+stars:>100`,
    ];

    let formattedRepos: any[] = [];
    let lastError: Error | null = null;

    // Try each query until we get results
    for (const query of searchQueries) {
      try {
        const response = await fetch(
          `https://api.github.com/search/repositories?q=${encodeURIComponent(
            query
          )}&sort=stars&order=desc&per_page=20`,
          {
            headers: {
              Accept: "application/vnd.github.v3+json",
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error(
            `GitHub API error for query "${query}":`,
            response.status,
            errorText
          );
          continue; // Try next query
        }

        const data = await response.json();

        if (data.items && data.items.length > 0) {
          // Format the response
          formattedRepos = data.items.map((repo: GitHubRepo) => ({
            id: repo.id,
            name: repo.name,
            fullName: repo.full_name,
            description: repo.description || "No description available",
            url: repo.html_url,
            stars: repo.stargazers_count,
            language: repo.language,
            createdAt: repo.created_at,
            updatedAt: repo.updated_at,
          }));

          // Remove duplicates by ID
          const uniqueRepos = formattedRepos.filter(
            (repo, index, self) =>
              index === self.findIndex((r) => r.id === repo.id)
          );

          // Update cache
          cache.data = uniqueRepos;
          cache.timestamp = now;

          return res.status(200).json(uniqueRepos);
        }
      } catch (err: any) {
        lastError = err;
        console.error(`Error with query "${query}":`, err);
        continue; // Try next query
      }
    }

    // If all queries failed, return error
    if (formattedRepos.length === 0) {
      throw (
        lastError || new Error("No repositories found with any search query")
      );
    }

    return res.status(200).json(formattedRepos);
  } catch (error: any) {
    console.error("Error fetching GitHub data:", error);
    return res.status(500).json({
      error: "Failed to fetch GitHub data",
      message: error.message,
    });
  }
}
