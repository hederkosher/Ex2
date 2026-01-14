import { useState, useEffect } from 'react';
import Head from 'next/head';
import NewsCard from '../components/NewsCard';
import SettingsModal from '../components/SettingsModal';
import styles from '../styles/Home.module.css';

interface Repo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'ai_news_api_key';
const STORAGE_PROVIDER_KEY = 'ai_news_provider';

export default function Home() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>('groq');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // Load API key and provider from localStorage
    const savedApiKey = localStorage.getItem(STORAGE_KEY);
    const savedProvider = localStorage.getItem(STORAGE_PROVIDER_KEY);
    
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    if (savedProvider) {
      setProvider(savedProvider);
    }

    // Fetch GitHub repositories
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/github');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || 'Failed to fetch repositories');
      }
      
      const data = await response.json();
      
      // Check if we got an array and it's not empty
      if (Array.isArray(data) && data.length > 0) {
        setRepos(data);
      } else if (Array.isArray(data) && data.length === 0) {
        setError('No repositories found. The search may be too restrictive.');
        setRepos([]);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Error fetching repos:', err);
      setError(err.message || 'Failed to load repositories. Please try again later.');
      setRepos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = (newApiKey: string, newProvider: string) => {
    localStorage.setItem(STORAGE_KEY, newApiKey);
    localStorage.setItem(STORAGE_PROVIDER_KEY, newProvider);
    setApiKey(newApiKey);
    setProvider(newProvider);
  };

  return (
    <>
      <Head>
        <title>AI News Aggregator</title>
        <meta name="description" content="Weekly AI/ML trends from GitHub" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>AI News Aggregator</h1>
          <button
            className={styles.settingsButton}
            onClick={() => setIsSettingsOpen(true)}
          >
            Settings
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          {error && <div className={styles.error}>{error}</div>}

          {loading ? (
            <div className={styles.loading}>Loading trending AI projects...</div>
          ) : repos.length === 0 ? (
            <div className={styles.emptyState}>
              <h2 className={styles.emptyStateTitle}>No repositories found</h2>
              <p className={styles.emptyStateText}>
                Try refreshing the page or check your connection.
              </p>
            </div>
          ) : (
            <>
              {!apiKey && (
                <div className={styles.info}>
                  💡 Set your API key in Settings to enable AI summarization
                </div>
              )}
              
              {repos.map((repo) => (
                <NewsCard
                  key={repo.id}
                  id={repo.id}
                  name={repo.name}
                  fullName={repo.fullName}
                  description={repo.description}
                  url={repo.url}
                  stars={repo.stars}
                  language={repo.language}
                  createdAt={repo.createdAt}
                  updatedAt={repo.updatedAt}
                  apiKey={apiKey}
                  provider={provider}
                />
              ))}
            </>
          )}
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        currentApiKey={apiKey}
        currentProvider={provider}
      />
    </>
  );
}
