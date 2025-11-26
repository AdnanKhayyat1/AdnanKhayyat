export interface BlogPost {
  id: string;
  title: string;
  date: string;
  summary: string;
  content: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "building-3d-interfaces",
    title: "Building 3D Interfaces",
    date: "2025-01-15",
    summary: "Reflections on using React Three Fiber for immersive web experiences...",
    content: `
      <p>Creating immersive 3D experiences on the web has never been more accessible, thanks to libraries like React Three Fiber (R3F).</p>
      <p>In this article, we explore the process of building a 3D portfolio, from the initial concept to the final optimization techniques.</p>
      <h3>Why R3F?</h3>
      <p>R3F allows us to use the declarative power of React to build scene graphs. This makes it easier to manage state, handle events, and integrate with the rest of the React ecosystem.</p>
      <h3>Performance Matters</h3>
      <p>When building for the web, performance is key. We look at instancing, texture compression, and careful use of lights to ensure a smooth 60fps experience across devices.</p>
    `
  },
  {
    id: "state-of-frontend",
    title: "The State of Frontend",
    date: "2024-12-20",
    summary: "How modern build tools and frameworks are reshaping our workflow...",
    content: `
      <p>The frontend landscape is constantly evolving. With the rise of meta-frameworks and new build tools like Vite and Turbopack, developers are more productive than ever.</p>
      <h3>The Shift to Server Components</h3>
      <p>React Server Components (RSC) are changing how we think about data fetching and rendering. By moving logic to the server, we can ship less JavaScript to the client.</p>
      <h3>CSS Evolution</h3>
      <p>From Tailwind CSS to CSS-in-JS, and now back to zero-runtime solutions, the way we style our applications is also going through a major shift.</p>
    `
  }
];

