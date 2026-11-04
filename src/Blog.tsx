import { useEffect } from "react";
import source from "../content/thoughts.md?raw";
import "./thoughts.css";

// Dated headings start posts; bodies are plain text, never executable HTML.
const thoughts = source.replace(/<!--[\s\S]*?-->/g, "")
  .split(/^##\s+/m).slice(1)
  .flatMap((entry, index) => {
    const [heading, ...lines] = entry.trim().split("\n");
    const date = heading.trim();
    const body = lines.join("\n").trim();
    const parsed = new Date(`${date}T12:00:00Z`);
    if (!body || !/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsed.getTime())) return [];
    return [{ date, body, index, label: parsed.toLocaleDateString("en-US", {
      month: "short", day: "2-digit", year: "numeric", timeZone: "UTC",
    }) }];
  }).sort((a, b) => b.date.localeCompare(a.date) || a.index - b.index);

export function Blog() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Thoughts — Adnan Khayyat";
    return () => { document.title = previous; };
  }, []);

  return (
    <div className="thoughts-page">
      <a className="thoughts-skip" href="#thoughts-feed">Skip to thoughts</a>
      <header className="thoughts-nav">
        <a className="thoughts-name" href="/" aria-label="Adnan Khayyat — home">Adnan Khayyat</a>
        <a className="thoughts-back" href="/">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
          Home
        </a>
      </header>
      <main>
        <section className="thoughts-masthead" aria-labelledby="thoughts-title">
          <h1 id="thoughts-title">Thoughts</h1>
          <div className="thoughts-masthead-bottom">
            <p>A few things on my mind.</p>
          </div>
        </section>
        <section className="thoughts-feed" id="thoughts-feed" aria-label="Recent thoughts" tabIndex={-1}>
          {thoughts.length ? thoughts.map((thought) => (
            <article className="thought" key={`${thought.date}-${thought.index}`}>
              <time dateTime={thought.date}>{thought.label}</time>
              <div className="thought-body">
                {thought.body.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
              </div>
            </article>
          )) : <p className="thoughts-empty">Quiet here for now. More thoughts soon.</p>}
          <div className="thoughts-end"><p>That's everything for now.</p></div>
        </section>
      </main>
      <footer className="thoughts-footer"><span>Adnan Khayyat</span><a href="#thoughts-title">Back to top ↑</a></footer>
    </div>
  );
}
