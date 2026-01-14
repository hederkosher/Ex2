import { useState, useEffect } from 'react';
import styles from '../styles/SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string, provider: string) => void;
  currentApiKey: string | null;
  currentProvider: string;
}

export default function SettingsModal({
  isOpen,
  onClose,
  onSave,
  currentApiKey,
  currentProvider,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState('groq');

  useEffect(() => {
    if (isOpen) {
      setApiKey(currentApiKey || '');
      setProvider(currentProvider || 'groq');
    }
  }, [isOpen, currentApiKey, currentProvider]);

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim(), provider);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="provider">
            AI Provider
          </label>
          <select
            id="provider"
            className={styles.select}
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="groq">Groq (Free)</option>
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic Claude</option>
          </select>
          <p className={styles.help}>
            Choose your preferred AI provider for summarization
          </p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="apiKey">
            API Key
          </label>
          <input
            id="apiKey"
            type="password"
            className={styles.input}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your API key"
          />
          <p className={styles.help}>
            Your API key is stored locally in your browser and never sent to our servers except for API requests.
            {provider === 'groq' && (
              <> Get a free API key at <a href="https://console.groq.com" target="_blank" rel="noopener noreferrer">console.groq.com</a></>
            )}
            {provider === 'openai' && (
              <> Get an API key at <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer">platform.openai.com</a></>
            )}
            {provider === 'anthropic' && (
              <> Get an API key at <a href="https://console.anthropic.com" target="_blank" rel="noopener noreferrer">console.anthropic.com</a></>
            )}
          </p>
        </div>

        <button className={styles.saveButton} onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}
