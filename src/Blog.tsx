import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from './Header';
import { blogPosts } from './blogData';

export default function Blog() {
  return (
    <div className="w-full min-h-screen bg-white text-black font-mono p-8 md:p-20">
      <Header />
      <div className="max-w-4xl mx-auto mt-20">
        <h1 className="text-6xl font-black mb-12">BLOG</h1>
        <div className="grid gap-12">
          {blogPosts.map((post) => (
            <article key={post.id} className="border-b-2 border-black pb-12">
              <div className="text-sm mb-2 opacity-50">{post.date}</div>
              <h2 className="text-3xl font-bold mb-4">{post.title}</h2>
              <p className="opacity-70 mb-4">
                {post.summary}
              </p>
              <Link 
                to={`/blog/${post.id}`} 
                className="underline decoration-2 underline-offset-4 hover:opacity-50 transition-opacity"
              >
                Read more
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}


