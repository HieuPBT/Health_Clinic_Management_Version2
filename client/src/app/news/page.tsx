'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import MySkeleton from '@/components/MySkeleton';

const NewsFeed = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const observer = useRef();
  const lastNewsElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  const fetchNews = useCallback(async () => {
    if (!hasMore) return;
    setLoading(true);
    try {
      const response = await axios.get('https://newsapi.org/v2/top-headlines?q=health', {
        params: {
          apiKey: process.env.NEXT_PUBLIC_NEWS_API_KEY,
          page: page,
          pageSize: 10, // Adjust this value as needed
        },
      });
      const newArticles = response.data.articles;
      setNews(prevNews => [...prevNews, ...newArticles]);
      setTotalResults(response.data.totalResults);
      setHasMore(news.length + newArticles.length < response.data.totalResults);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch news');
      setLoading(false);
    }
  }, [page, hasMore, news.length]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  if (error) return <MySkeleton rows={10} maxWidth={70} minWidth={50} />;

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.map((article, index) => (
          <div
            key={index}
            ref={index === news.length - 1 ? lastNewsElementRef : null}
            className="border rounded-lg overflow-hidden shadow-lg"
          >
            {article.urlToImage && (
              <img src={article.urlToImage} alt={article.title} className="w-full h-48 object-cover" />
            )}
            <div className="p-4">
              <h2 className="font-bold text-xl mb-2">{article.title}</h2>
              <p className="text-base">{article.description}</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Xem chi tiết
              </a>
            </div>
          </div>
        ))}
      </div>
      {loading && <MySkeleton rows={10} maxWidth={70} minWidth={50} />}
      {!hasMore && <div className="text-center mt-4">No more articles to load</div>}
      {news.length > 0 && (
        <div className="text-center mt-4">
          Showing {news.length} out of {totalResults} articles
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
