import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'

import { ServiceOpeningLayer } from '../components/ServiceOpeningLayer.tsx'
import {
  createServiceDetailCache,
  prefetchServiceDetail,
  useServicesList,
} from '../hooks/useServicesPageData.ts'
import { SERVICE_DETAIL_BLOCK_EXIT_DURATION_MS } from '../presentation/service-detail-motion.ts'
import type { ServiceSummaryPresentation } from '../presentation/services-page.ts'
import {
  createServiceOpeningGeometry,
  toServiceTransitionRect,
} from './service-route-motion.ts'
import type {
  ServiceClosingState,
  ServiceOpeningRequest,
  ServiceOpeningState,
} from './service-route-motion.ts'
import type { ServicesRouteContextValue } from './services-route-context.ts'
import styles from './ServicesRoute.module.css'

const OPENING_DURATION_MS = 300
const HANDOFF_DURATION_MS = 60
const CLOSING_DURATION_MS = 220

export function ServicesRoute() {
  const navigate = useNavigate()
  const { retry, state } = useServicesList()
  const [detailCache] = useState(createServiceDetailCache)
  const [openingTransition, setOpeningTransition] =
    useState<ServiceOpeningState | null>(null)
  const [closingTransition, setClosingTransition] =
    useState<ServiceClosingState | null>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | null>(null)
  const openingTimerRef = useRef<number | null>(null)
  const handoffTimerRef = useRef<number | null>(null)
  const closingContentTimerRef = useRef<number | null>(null)
  const closingFrameRef = useRef<number | null>(null)
  const closingTimerRef = useRef<number | null>(null)

  const clearOpeningTimers = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (openingTimerRef.current !== null) {
      window.clearTimeout(openingTimerRef.current)
      openingTimerRef.current = null
    }
    if (handoffTimerRef.current !== null) {
      window.clearTimeout(handoffTimerRef.current)
      handoffTimerRef.current = null
    }
    if (closingContentTimerRef.current !== null) {
      window.clearTimeout(closingContentTimerRef.current)
      closingContentTimerRef.current = null
    }
    if (closingFrameRef.current !== null) {
      window.cancelAnimationFrame(closingFrameRef.current)
      closingFrameRef.current = null
    }
    if (closingTimerRef.current !== null) {
      window.clearTimeout(closingTimerRef.current)
      closingTimerRef.current = null
    }
  }, [])

  const beginServiceOpening = useCallback(
    (request: ServiceOpeningRequest) => {
      const content = contentRef.current
      if (!content || openingTransition || closingTransition) return false

      clearOpeningTimers()
      const geometry = createServiceOpeningGeometry(
        request,
        toServiceTransitionRect(content.getBoundingClientRect()),
      )
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      void prefetchServiceDetail(request.service.slug, detailCache).catch(() => undefined)
      setOpeningTransition({
        detailResolved: false,
        geometry,
        phase: 'preparing',
        service: request.service,
      })

      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = null
        setOpeningTransition((current) =>
          current?.service.slug === request.service.slug
            ? { ...current, phase: reducedMotion ? 'settled' : 'opening' }
            : current,
        )

        const finishOpening = () => {
          openingTimerRef.current = null
          setOpeningTransition((current) =>
            current?.service.slug === request.service.slug
              ? {
                  ...current,
                  phase: current.detailResolved ? 'handoff' : 'settled',
                }
              : current,
          )
          void navigate(`/services/${request.service.slug}`)
        }

        if (reducedMotion) finishOpening()
        else {
          openingTimerRef.current = window.setTimeout(
            finishOpening,
            OPENING_DURATION_MS,
          )
        }
      })

      return true
    },
    [
      clearOpeningTimers,
      closingTransition,
      detailCache,
      navigate,
      openingTransition,
    ],
  )

  const beginServiceClosing = useCallback(
    (service: ServiceSummaryPresentation) => {
      if (openingTransition || closingTransition) return false

      const reducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
      if (reducedMotion) {
        void navigate('/services')
        return true
      }

      setClosingTransition({ geometry: null, phase: 'content-exit', service })
      closingContentTimerRef.current = window.setTimeout(() => {
        closingContentTimerRef.current = null
        setClosingTransition((current) =>
          current?.service.slug === service.slug
            ? { ...current, phase: 'measuring' }
            : current,
        )
        void navigate('/services')
      }, SERVICE_DETAIL_BLOCK_EXIT_DURATION_MS)

      return true
    },
    [closingTransition, navigate, openingTransition],
  )

  const reportServiceClosingTarget = useCallback(
    (request: ServiceOpeningRequest) => {
      const content = contentRef.current
      if (
        !content ||
        closingFrameRef.current !== null ||
        closingTransition?.phase !== 'measuring' ||
        closingTransition.service.slug !== request.service.slug
      ) {
        return
      }

      setClosingTransition((current) => {
        if (
          current?.phase !== 'measuring' ||
          current.service.slug !== request.service.slug
        ) {
          return current
        }

        return {
          ...current,
          geometry: createServiceOpeningGeometry(
            request,
            toServiceTransitionRect(content.getBoundingClientRect()),
          ),
        }
      })

      closingFrameRef.current = window.requestAnimationFrame(() => {
        closingFrameRef.current = window.requestAnimationFrame(() => {
          closingFrameRef.current = null
          setClosingTransition((current) =>
            current?.phase === 'measuring' &&
            current.service.slug === request.service.slug &&
            current.geometry
              ? { ...current, phase: 'collapsing' }
              : current,
          )

          closingTimerRef.current = window.setTimeout(() => {
            closingTimerRef.current = null
            setClosingTransition(null)
          }, CLOSING_DURATION_MS)
        })
      })
    },
    [closingTransition],
  )

  const reportServiceDetailResolution = useCallback((slug: string) => {
    setOpeningTransition((current) =>
      current?.service.slug === slug
        ? {
            ...current,
            detailResolved: true,
            phase: current.phase === 'settled' ? 'handoff' : current.phase,
          }
        : current,
    )
  }, [])

  useEffect(() => {
    if (openingTransition?.phase !== 'handoff') return

    handoffTimerRef.current = window.setTimeout(() => {
      handoffTimerRef.current = null
      setOpeningTransition(null)
    }, HANDOFF_DURATION_MS)

    return () => {
      if (handoffTimerRef.current !== null) {
        window.clearTimeout(handoffTimerRef.current)
        handoffTimerRef.current = null
      }
    }
  }, [openingTransition?.phase])

  useEffect(() => clearOpeningTimers, [clearOpeningTimers])

  return (
    <section className={styles.page} aria-labelledby="services-title">
      <header className={styles.header}>
        <h1 className={styles.title} id="services-title">
          HOW I BUILD STUFF
        </h1>
      </header>
      <div className={styles.content} ref={contentRef}>
        <Outlet
          context={{
            beginServiceClosing,
            beginServiceOpening,
            closingServiceSlug: closingTransition?.service.slug ?? null,
            detailCache,
            reportServiceClosingTarget,
            reportServiceDetailResolution,
            servicesState: state,
            retryServices: retry,
          } satisfies ServicesRouteContextValue}
        />
        {openingTransition ? (
          <ServiceOpeningLayer transition={openingTransition} />
        ) : null}
        {closingTransition && closingTransition.phase !== 'content-exit' ? (
          <ServiceOpeningLayer
            direction="closing"
            transition={closingTransition}
          />
        ) : null}
      </div>
    </section>
  )
}
