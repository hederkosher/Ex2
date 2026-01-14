import { useState } from 'react';
import styles from '../styles/NewsCard.module.css';

interface NewsCardProps {
  id: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  stars: number;
  language: string;
  createdAt: string;
  updatedAt: string;
  apiKey: string | null;
  provider: string;
}

export default function NewsCard({
  name,
  fullName,
  description,
  url,
  stars,
  language,
  apiKey,
  provider,
}: NewsCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!apiKey) {
      setError('Please set your API key in settings first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null);

    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: description,
          apiKey,
          provider,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message
        const errorMsg = data.message || data.error || 'Failed to generate summary';
        throw new Error(errorMsg);
      }

      if (!data.summary) {
        throw new Error('No summary received from server');
      }

      setSummary(data.summary);
    } catch (err: any) {
      // Show the actual error message
      const errorMessage = err.message || 'Failed to generate summary. Please check your API key and try again.';
      setError(errorMessage);
      console.error('Summarize error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>{name}</h2>
          <a href={url} target="_blank" rel="noopener noreferrer" className={styles.link}>
            {fullName} →
          </a>
        </div>
      </div>
      
      <p className={styles.description}>{description}</p>
      
      <div className={styles.meta}>
        <span className={styles.metaItem}>
          ⭐ {stars.toLocaleString()} stars
        </span>
        {language && (
          <span className={styles.metaItem}>
            💻 {language}
          </span>
        )}
      </div>

      <button
        onClick={handleSummarize}
        disabled={isLoading || !apiKey}
        className={styles.button}
      >
        {isLoading ? 'Summarizing...' : 'Summarize'}
      </button>

      {error && <div className={styles.error}>{error}</div>}

      {summary && (
        <div className={styles.summary}>
          <strong>Summary:</strong> {summary}
        </div>
      )}
    </div>
  );
}
