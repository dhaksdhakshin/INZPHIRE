import { placeholderPages } from "../data";

interface PlaceholderPageProps {
  pageId: keyof typeof placeholderPages;
}

export default function PlaceholderPage({ pageId }: PlaceholderPageProps) {
  const copy = placeholderPages[pageId];

  return (
    <main className="page">
      <section className="page__content">
        <div className="placeholder">
          <span className="placeholder__eyebrow">Page structure scaffolded</span>
          <h1>{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
      </section>
    </main>
  );
}
