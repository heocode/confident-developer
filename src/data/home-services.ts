import backendDevelopmentIconUrl from '../assets/icons/services/backend-development.svg'
import mobileDevelopmentIconUrl from '../assets/icons/services/mobile-development.svg'
import productUiUxIconUrl from '../assets/icons/services/product-ui-ux.svg'
import webDevelopmentIconUrl from '../assets/icons/services/web-development.svg'
import type { HomeService } from '../features/services/model/service.types.ts'

export const homeServices = [
  {
    description:
      'Designing clear, user-friendly experiences that make products feel simple and natural to use.',
    icon: { src: productUiUxIconUrl, width: 85, height: 83 },
    id: 'product-ui-ux',
    title: 'Product & UI/UX Design',
    tone: 'product',
  },
  {
    description:
      'Building smooth, reliable mobile experiences that feel natural to use across iOS and Android.',
    icon: { src: mobileDevelopmentIconUrl, width: 60, height: 85 },
    id: 'mobile-development',
    title: 'Mobile Development',
    tone: 'mobile',
  },
  {
    description:
      'Building responsive web experiences that feel fast, clear, and polished across every screen.',
    icon: { src: webDevelopmentIconUrl, width: 85, height: 75 },
    id: 'web-development',
    title: 'Web Development',
    tone: 'web',
  },
  {
    description: 'Designing backend systems that make products reliable, secure, and ready to grow.',
    icon: { src: backendDevelopmentIconUrl, width: 84, height: 84 },
    id: 'backend-architecture',
    title: 'Backend & Architecture',
    tone: 'backend',
  },
] as const satisfies readonly HomeService[]
