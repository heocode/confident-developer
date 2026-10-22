import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { AppLayout } from '../components/layout/AppLayout'
import { ContactRoute } from '../features/contact/routes/ContactRoute.tsx'
import { ProjectDetailRoute } from '../features/projects/routes/ProjectDetailRoute'
import { ProjectsIndexRoute } from '../features/projects/routes/ProjectsIndexRoute.tsx'
import { ProjectsRoute } from '../features/projects/routes/ProjectsRoute'
import { ServiceDetailRoute } from '../features/services/routes/ServiceDetailRoute.tsx'
import { ServicesIndexRoute } from '../features/services/routes/ServicesIndexRoute.tsx'
import { ServicesRoute } from '../features/services/routes/ServicesRoute.tsx'
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
      {
        path: 'services',
        element: <ServicesRoute />,
        children: [
          { index: true, element: <ServicesIndexRoute /> },
          { path: ':slug', element: <ServiceDetailRoute /> },
        ],
      },
      { path: 'about', element: <PlaceholderPage title="About me" /> },
      { path: 'references', element: <PlaceholderPage title="References" /> },
      { path: 'contact', element: <ContactRoute /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
