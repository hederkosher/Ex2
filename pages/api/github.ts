import type { NextApiRequest, NextApiResponse } from 'next';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check cache
  const now = Date.now();
  if (cache.data && (now - cache.timestamp) < CACHE_DURATION) {
    return res.status(200).json(cache.data);
  }

  try {
    // Calculate date 24 hours ago
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const since = yesterday.toISOString().split('T')[0];

    // Fetch trending repositories with AI/ML topics
    // Search for repos created or updated in last 24 hours with AI/ML topics, sorted by stars
    const response = await fetch(
      `https://api.github.com/search/repositories?q=(created:>${since}+OR+pushed:>${since})+topic:ai+topic:machine-learning&sort=stars&order=desc&per_page=20`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Format the response
    const formattedRepos = data.items.map((repo: GitHubRepo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description || 'No description available',
      url: repo.html_url,
      stars: repo.stargazers_count,
      language: repo.language,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
    }));

    // Update cache
    cache.data = formattedRepos;
    cache.timestamp = now;

    return res.status(200).json(formattedRepos);
  } catch (error: any) {
    console.error('Error fetching GitHub data:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch GitHub data',
      message: error.message 
    });
  }
}
