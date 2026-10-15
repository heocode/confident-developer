const referenceDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Toronto',
})

export function formatReferenceDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const dateParts = Object.fromEntries(
    referenceDateFormatter
      .formatToParts(date)
      .filter(({ type }) => type === 'day' || type === 'month' || type === 'year')
      .map(({ type, value: partValue }) => [type, partValue]),
  )

  return `${dateParts.day} ${dateParts.month} ${dateParts.year}`
}
