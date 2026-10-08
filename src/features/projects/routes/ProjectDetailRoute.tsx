import { useParams } from 'react-router-dom'

export function ProjectDetailRoute() {
  const { slug } = useParams()

  return (
    <p>
      Project route: <code>{slug}</code>
    </p>
  )
}
