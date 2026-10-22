import { useLayoutEffect, useState } from 'react'
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react'

import { useServiceShowcaseLayout } from '../hooks/useServiceShowcaseLayout.ts'
import { SERVICE_SHOWCASE_LAYOUT_TOKENS } from '../presentation/service-showcase-layout.ts'
import type { ShowcaseAssetPresentation } from '../presentation/services-page.ts'
import styles from './ServiceShowcaseRail.module.css'

interface ServiceShowcaseRailProps {
  assets: ShowcaseAssetPresentation[]
  children: ReactNode
  serviceSlug: string
  serviceTitle: string
}

type RailStyle = CSSProperties & {
  '--service-showcase-compact-size': string
  '--service-showcase-height': string
  '--service-showcase-information-width': string
}

type GroupStyle = CSSProperties & {
  '--service-showcase-group-width': string
}

function ServiceShowcaseAsset({
  asset,
  isCompact,
  isPriority,
}: {
  asset: ShowcaseAssetPresentation
  isCompact: boolean
  isPriority: boolean
}) {
  const [hasFailed, setHasFailed] = useState(false)
  const image = asset.kind === 'image' ? asset : asset.preview

  return (
    <div className={isCompact ? `${styles.panel} ${styles.compactPanel}` : styles.panel}>
      {hasFailed ? (
        <p className={styles.mediaError} role="status">
          Showcase preview unavailable
        </p>
      ) : (
        <img
          alt={image.alt}
          className={asset.kind === 'video' ? styles.videoMedia : undefined}
          decoding="async"
          fetchPriority={isPriority ? 'high' : 'auto'}
          height={image.height}
          loading={isPriority ? 'eager' : 'lazy'}
          onError={() => setHasFailed(true)}
          src={image.url}
          width={image.width}
        />
      )}
    </div>
  )
}

export function ServiceShowcaseRail({
  assets,
  children,
  serviceSlug,
  serviceTitle,
}: ServiceShowcaseRailProps) {
  const { groups, layout, railRef } = useServiceShowcaseLayout(assets)
  const railStyle: RailStyle = {
    '--service-showcase-compact-size': `${layout?.compactPanelSize ?? 180}px`,
    '--service-showcase-height': `${layout?.height ?? SERVICE_SHOWCASE_LAYOUT_TOKENS.baseHeight}px`,
    '--service-showcase-information-width': `${
      layout?.informationPanelWidth ??
      SERVICE_SHOWCASE_LAYOUT_TOKENS.informationPanelWidth
    }px`,
  }

  useLayoutEffect(() => {
    railRef.current?.scrollTo({ left: 0 })
  }, [railRef, serviceSlug])

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.target !== event.currentTarget) return

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        event.currentTarget.scrollBy({ left: -event.currentTarget.clientWidth * 0.8 })
        break
      case 'ArrowRight':
        event.preventDefault()
        event.currentTarget.scrollBy({ left: event.currentTarget.clientWidth * 0.8 })
        break
      case 'Home':
        event.preventDefault()
        event.currentTarget.scrollTo({ left: 0 })
        break
      case 'End':
        event.preventDefault()
        event.currentTarget.scrollTo({ left: event.currentTarget.scrollWidth })
        break
    }
  }

  return (
    <section
      aria-label={`${serviceTitle} service content`}
      className={styles.rail}
      onKeyDown={handleKeyDown}
      ref={railRef}
      style={railStyle}
      tabIndex={0}
    >
      <ol className={styles.track}>
        {groups.map((group, groupIndex) => {
          const groupStyle: GroupStyle = {
            '--service-showcase-group-width': `${
              layout?.groupWidths[groupIndex] ??
              (group.kind === 'compact'
                ? 180
                : SERVICE_SHOWCASE_LAYOUT_TOKENS.basePanelWidth)
            }px`,
          }

          return (
            <li
              className={
                group.kind === 'compact'
                  ? `${styles.group} ${styles.compactGroup}`
                  : styles.group
              }
              key={group.assets[0].id}
              style={groupStyle}
            >
              {group.assets.map((asset, assetIndex) => (
                <ServiceShowcaseAsset
                  asset={asset}
                  isCompact={group.kind === 'compact'}
                  isPriority={groupIndex === 0 && assetIndex === 0}
                  key={asset.id}
                />
              ))}
            </li>
          )
        })}
        <li className={styles.informationSlide}>
          <div className={styles.informationColumn}>{children}</div>
        </li>
      </ol>
    </section>
  )
}
