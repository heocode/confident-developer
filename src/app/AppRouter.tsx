import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AppLayout } from '../components/layout/AppLayout'
import { ProjectDetailRoute } from '../features/projects/routes/ProjectDetailRoute'
import { ProjectsIndexRoute, ProjectsRoute } from '../features/projects/routes/ProjectsRoute'
import { HomePage } from '../pages/home/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { PlaceholderPage } from '../pages/PlaceholderPage'

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'projects',
        element: <ProjectsRoute />,
        children: [
          { index: true, element: <ProjectsIndexRoute /> },
          { path: ':slug', element: <ProjectDetailRoute /> },
        ],
      },
      { path: 'services', element: <PlaceholderPage title="Services" /> },
      { path: 'about', element: <PlaceholderPage title="About me" /> },
      { path: 'references', element: <PlaceholderPage title="References" /> },
      { path: 'contact', element: <PlaceholderPage title="Contact Me" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
