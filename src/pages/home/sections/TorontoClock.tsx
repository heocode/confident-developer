import { useEffect, useState } from 'react'

import { siteIdentity } from '../../../data/site'
import styles from './TorontoClock.module.css'
import { formatTorontoTime } from '../utils/toronto-time'

const ONE_MINUTE = 60_000

export function TorontoClock() {
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    let intervalId: number | undefined
    const delayUntilNextMinute = ONE_MINUTE - (Date.now() % ONE_MINUTE)
    const timeoutId = window.setTimeout(() => {
      setCurrentTime(new Date())
      intervalId = window.setInterval(() => setCurrentTime(new Date()), ONE_MINUTE)
    }, delayUntilNextMinute)

    return () => {
      window.clearTimeout(timeoutId)
      if (intervalId !== undefined) window.clearInterval(intervalId)
    }
  }, [])

  return (
    <p className={styles.clock}>
      <span>Toronto CA</span>
      <time dateTime={currentTime.toISOString()}>{formatTorontoTime(currentTime, siteIdentity.timezone)}</time>
    </p>
  )
}
