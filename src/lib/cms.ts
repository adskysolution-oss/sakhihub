'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface ContentItem {
  id: string;
  section_key: string;
  content_key: string;
  content_value: any; // Can be string, object, or array
  language: string;
}

export function useCMS(section: string, language: string = 'en') {
  const [content, setContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from('site_content')
          .select('content_key, content_value')
          .eq('section_key', section)
          .eq('language', language);

        if (error) throw error;

        const contentMap: Record<string, any> = {};
        data?.forEach((item) => {
          contentMap[item.content_key] = item.content_value;
        });

        setContent(contentMap);
      } catch (err) {
        console.error(`CMS Error [${section}]:`, err);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [section, language]);

  const t = (key: string, fallback: string = "") => {
    return content[key] || fallback;
  };

  return { content, loading, t };
}
