export type PrimaryRouteId =
  | 'home'
  | 'projects'
  | 'services'
  | 'about'
  | 'references'
  | 'contact'

export type RouteTransitionDirection = 'backward' | 'forward'
export type RouteMotionPreset = 'custom' | 'fallback'

export interface PrimaryRouteDefinition {
  id: PrimaryRouteId
  label: string
  motionPreset: RouteMotionPreset
  navigationIndex: number
  path: string
}

export const primaryRoutes = [
  {
    id: 'home',
    label: 'Home',
    motionPreset: 'fallback',
    navigationIndex: 0,
    path: '/',
  },
  {
    id: 'projects',
    label: 'Projects',
    motionPreset: 'fallback',
    navigationIndex: 1,
    path: '/projects',
  },
  {
    id: 'services',
    label: 'Services',
    motionPreset: 'fallback',
    navigationIndex: 2,
    path: '/services',
  },
  {
    id: 'about',
    label: 'About me',
    motionPreset: 'fallback',
    navigationIndex: 3,
    path: '/about',
  },
  {
    id: 'references',
    label: 'References',
    motionPreset: 'fallback',
    navigationIndex: 4,
    path: '/references',
  },
  {
    id: 'contact',
    label: 'Contact Me',
    motionPreset: 'fallback',
    navigationIndex: 5,
    path: '/contact',
  },
] as const satisfies readonly PrimaryRouteDefinition[]

function normalizePathname(pathname: string) {
  if (pathname === '/') return pathname
  return pathname.replace(/\/+$/, '') || '/'
}

export function findPrimaryRoute(pathname: string): PrimaryRouteDefinition | null {
  const normalizedPathname = normalizePathname(pathname)

  return (
    primaryRoutes.find(({ path }) => {
      if (path === '/') return normalizedPathname === path
      return normalizedPathname === path || normalizedPathname.startsWith(`${path}/`)
    }) ?? null
  )
}

export function getRouteTransitionDirection(
  source: PrimaryRouteDefinition | null,
  target: PrimaryRouteDefinition | null,
): RouteTransitionDirection | null {
  if (!source || !target || source.id === target.id) return null

  return target.navigationIndex > source.navigationIndex ? 'forward' : 'backward'
}
