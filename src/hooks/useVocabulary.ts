import { useState, useEffect } from 'react';
import { vocabularyAPI, VocabularyItemAPI } from '../services/api/vocabulary.api';

interface UseVocabularyResult {
  vocabularyItems: VocabularyItemAPI[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useVocabulary = (lessonId: string): UseVocabularyResult => {
  const [vocabularyItems, setVocabularyItems] = useState<VocabularyItemAPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabulary = async () => {
    if (!lessonId) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const vocabulary = await vocabularyAPI.getVocabularyByLesson(lessonId);
      setVocabularyItems(vocabulary);
    } catch (err) {
      console.error('Error fetching vocabulary:', err);
      setError(err instanceof Error ? err.message : 'Không thể tải từ vựng');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabulary();
  }, [lessonId]);

  return {
    vocabularyItems,
    isLoading,
    error,
    refetch: fetchVocabulary,
  };
}; 