interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <section className="route-page" aria-labelledby="placeholder-title">
      <p className="route-page__eyebrow">Route foundation</p>
      <h1 id="placeholder-title">{title}</h1>
      <p>This page will be implemented from its approved design in a dedicated iteration.</p>
    </section>
  )
}
