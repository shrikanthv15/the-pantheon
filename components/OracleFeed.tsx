'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ArticleCard } from '@/components/ArticleCard';
import type { Article, ArticleCategory } from '@/types';

interface OracleFeedProps {
  articles: Article[];
}

const categoryFilters: { value: ArticleCategory | 'all'; label: string; color: string }[] = [
  { value: 'all', label: 'All', color: '#f0f0f5' },
  { value: 'model_release', label: 'Model Release', color: '#fbbf24' },
  { value: 'framework', label: 'Framework', color: '#22d3ee' },
  { value: 'github', label: 'GitHub', color: '#a78bfa' },
  { value: 'funding', label: 'Funding', color: '#10b981' },
  { value: 'research', label: 'Research', color: '#9ca3af' },
];

export function OracleFeed({ articles }: OracleFeedProps) {
  const [selectedCategory, setSelectedCategory] = useState<ArticleCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [articles, selectedCategory, searchQuery]);

  return (
    <section id="articles" className="px-4 py-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            THE ORACLE FEED
          </h2>
          <p className="text-muted-foreground">
            Intelligence compiled by <span className="text-[#22d3ee]">Loki</span>. Published by <span className="text-[#a78bfa]">Mimir</span>.
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8"
        >
          {/* Category chips */}
          <div className="flex flex-wrap items-center gap-2">
            {categoryFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setSelectedCategory(filter.value)}
                className={`
                  px-3 py-1.5 rounded-full text-xs font-medium border transition-all
                  ${selectedCategory === filter.value
                    ? 'bg-foreground text-background border-foreground'
                    : 'bg-transparent text-muted-foreground border-border hover:border-foreground/50'
                  }
                `}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-surface border-border"
            />
          </div>
        </motion.div>

        {/* Masonry grid */}
        <div 
          className="columns-1 md:columns-2 lg:columns-3 gap-4"
          style={{ columnFill: 'balance' }}
        >
          {filteredArticles.map((article, index) => (
            <ArticleCard key={article.id} article={article} index={index} />
          ))}
        </div>

        {/* Load more button */}
        {filteredArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex justify-center mt-8"
          >
            {/* TODO: Implement Supabase pagination */}
            <Button
              variant="outline"
              className="border-border hover:bg-surface"
              disabled
            >
              Load More
            </Button>
          </motion.div>
        )}

        {/* Empty state */}
        {filteredArticles.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-muted-foreground">No articles found matching your criteria.</p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
