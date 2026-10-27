interface AboutInfoCardProps {
  label: string
  value: string
}

export function AboutInfoCard({ label, value }: AboutInfoCardProps) {
  return (
    <article>
      <h2>{label}</h2>
      <p>{value}</p>
    </article>
  )
}
