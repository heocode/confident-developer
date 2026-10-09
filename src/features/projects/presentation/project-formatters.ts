import type { PublicProject } from '../model/project.types.ts'

const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function formatMonthYear(date: string) {
  return monthYearFormatter.format(new Date(date))
}

export function formatProjectTimeline(timeline: PublicProject['timeline']) {
  const endDate = timeline.endDate ? formatMonthYear(timeline.endDate) : 'Ongoing'
  return `${formatMonthYear(timeline.startDate)} - ${endDate}`
}
