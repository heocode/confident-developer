import { useLayoutEffect, useState } from 'react'
import type { CSSProperties, KeyboardEvent, ReactNode, RefObject } from 'react'

import { useServiceShowcaseLayout } from '../hooks/useServiceShowcaseLayout.ts'
import {
  getServiceBlockEnterDelay,
  getServiceBlockExitDelay,
} from '../presentation/service-detail-motion.ts'
import { SERVICE_SHOWCASE_LAYOUT_TOKENS } from '../presentation/service-showcase-layout.ts'
import type { ShowcaseAssetPresentation } from '../presentation/services-page.ts'
import entranceStyles from './ServiceBlockEntrance.module.css'
import styles from './ServiceShowcaseRail.module.css'
import { ServiceVideoShowcase } from './ServiceVideoShowcase.tsx'

interface ServiceShowcaseRailProps {
  assets: ShowcaseAssetPresentation[]
  children: ReactNode
  serviceSlug: string
  serviceTitle: string
}

type RailStyle = CSSProperties & {
  '--service-showcase-compact-size': string
  '--service-showcase-gap': string
  '--service-showcase-height': string
  '--service-showcase-information-width': string
  '--service-showcase-scale': number
}

type GroupStyle = CSSProperties & {
  '--service-showcase-group-width': string
}

type EnterStyle = CSSProperties & {
  '--service-block-enter-delay': string
  '--service-block-exit-delay': string
}

function getEnterStyle(index: number, blockCount: number): EnterStyle {
  return {
    '--service-block-enter-delay': `${getServiceBlockEnterDelay(index)}ms`,
    '--service-block-exit-delay': `${getServiceBlockExitDelay(index, blockCount)}ms`,
  }
}

function ServiceShowcaseAsset({
  asset,
  blockCount,
  enterIndex,
  isCompact,
  isPriority,
  railRef,
}: {
  asset: ShowcaseAssetPresentation
  blockCount: number
  enterIndex: number
  isCompact: boolean
  isPriority: boolean
  railRef: RefObject<HTMLElement | null>
}) {
  const [hasFailed, setHasFailed] = useState(false)
  const image = asset.kind === 'image' ? asset : asset.preview

  return (
    <div
      className={`${styles.panel} ${entranceStyles.block}${
        isCompact ? ` ${styles.compactPanel}` : ''
      }`}
      style={getEnterStyle(enterIndex, blockCount)}
    >
      {asset.kind === 'video' ? (
        <ServiceVideoShowcase
          asset={asset}
          isPriority={isPriority}
          railRef={railRef}
        />
      ) : hasFailed ? (
        <p className={styles.mediaError} role="status">
          Showcase preview unavailable
        </p>
      ) : (
        <img
          alt={image.alt}
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
  const blockCount = assets.length + 4
  const railStyle: RailStyle = {
    '--service-showcase-compact-size': `${layout?.compactPanelSize ?? 180}px`,
    '--service-showcase-gap': `${layout?.gap ?? SERVICE_SHOWCASE_LAYOUT_TOKENS.gap}px`,
    '--service-showcase-height': `${layout?.height ?? SERVICE_SHOWCASE_LAYOUT_TOKENS.baseHeight}px`,
    '--service-showcase-information-width': `${
      layout?.informationPanelWidth ??
      SERVICE_SHOWCASE_LAYOUT_TOKENS.informationPanelWidth
    }px`,
    '--service-showcase-scale': layout?.scale ?? 1,
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
  const groupEnterOffsets = groups.map((_, groupIndex) =>
    groups
      .slice(0, groupIndex)
      .reduce((total, group) => total + group.assets.length, 0),
  )

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
              {group.assets.map((asset, groupAssetIndex) => {
                return (
                  <ServiceShowcaseAsset
                    asset={asset}
                    blockCount={blockCount}
                    enterIndex={groupEnterOffsets[groupIndex] + groupAssetIndex}
                    isCompact={group.kind === 'compact'}
                    isPriority={groupIndex === 0 && groupAssetIndex === 0}
                    key={asset.id}
                    railRef={railRef}
                  />
                )
              })}
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
