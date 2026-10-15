import { useHomeReferences } from '../hooks/useHomeReferences.ts'
import styles from './HomeReferencesSection.module.css'
import { ReferenceEmptyState } from './ReferenceEmptyState.tsx'
import { ReferenceList } from './ReferenceList.tsx'

export function HomeReferencesSection() {
  const { loadNextPage, retry, state } = useHomeReferences()

  return (
    <section
      className={styles.section}
      id="home-references"
      aria-labelledby="home-references-title"
    >
      <header className={styles.header}>
        <h2 id="home-references-title">WHAT PEOPLE SAY ABOUT THE STUFF</h2>
      </header>

      <div className={styles.panel}>
        {state.status === 'loading' && (
          <div className={styles.state} role="status" aria-live="polite">
            <p>Loading references…</p>
          </div>
        )}

        {state.status === 'empty' && state.emptyState && (
          <ReferenceEmptyState emptyState={state.emptyState} />
        )}

        {state.status === 'empty' && !state.emptyState && (
          <div className={styles.state}>
            <h3>No references yet</h3>
          </div>
        )}

        {state.status === 'error' && (
          <div className={styles.state} role="alert">
            <h3>References are unavailable</h3>
            <p>{state.message}</p>
            <button type="button" onClick={retry}>
              Try again
            </button>
          </div>
        )}

        {state.status === 'ready' && (
          <ReferenceList
            items={state.items}
            pagination={state.pagination}
            isLoadingMore={state.isLoadingMore}
            loadMoreErrorMessage={state.loadMoreErrorMessage}
            onLoadNextPage={loadNextPage}
          />
        )}
      </div>
    </section>
  )
}
