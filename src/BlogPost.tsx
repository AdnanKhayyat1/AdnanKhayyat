import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from './Header';
import { blogPosts } from './blogData';

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find(p => p.id === id);

  if (!post) {
    return (
      <div className="w-full min-h-screen bg-white text-black font-mono p-20">
        <Header />
        <div className="max-w-4xl mx-auto mt-20">
          <h1 className="text-4xl font-black mb-8">Post not found</h1>
          <Link to="/blog" className="underline decoration-2 underline-offset-4">Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-black font-mono p-8 md:p-20">
      <Header />
      <article className="max-w-3xl mx-auto mt-20">
        <Link to="/blog" className="inline-block mb-8 text-sm opacity-50 hover:opacity-100 transition-opacity">
          ← Back to Blog
        </Link>
        <div className="text-sm mb-4 opacity-50">{post.date}</div>
        <h1 className="text-4xl md:text-6xl font-black mb-12 leading-tight">{post.title}</h1>
        
        <div 
          className="prose prose-lg prose-headings:font-black prose-p:font-mono max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}

