import { Header } from "./Header";

export function Blog() {
  return (
    <div className="min-h-screen bg-white text-black font-inter">
      <Header />
      <main className="pt-28 px-3 md:px-4 ">
        <BlogHeader />
        <BlogThumbnail title="The Future of AI" date="2026-01-01" id="1" />
      </main>
    </div>
  );
}

export function BlogHeader() {
  return (
    <div className="flex justify-between items-start w-[100vw] text-8xl py-12">
      BLOG
    </div>
  );
}

export function BlogThumbnail({ title, date, id }: { title: string, date: string, id: string }) {
  return (
    <div
      className="w-full border-2 rounded-xs hover:bg-blue-200 hover:cursor-pointer transition-all duration-300"
      data-id={id}
    >
      <div className="flex justify-between items-start">
        <div className="text-2xl font-bold">{title}</div>
        <div className="text-sm text-gray-500">{date}</div>
      </div>
    </div>
  );
}

