import { Outlet } from 'react-router-dom'

export function ProjectsRoute() {
  return (
    <section className="route-page" aria-labelledby="projects-title">
      <p className="route-page__eyebrow">Projects</p>
      <h1 id="projects-title">THE STUFF ARCHIVE</h1>
      <Outlet />
    </section>
  )
}

export function ProjectsIndexRoute() {
  return <p>The project archive will be connected to the public Projects API in the next iteration.</p>
}
