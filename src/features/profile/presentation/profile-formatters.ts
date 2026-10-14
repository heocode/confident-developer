const profilePostDateFormatters = new Map<string, Intl.DateTimeFormat>()

function getProfilePostDateFormatter(timeZone: string) {
  const existingFormatter = profilePostDateFormatters.get(timeZone)
  if (existingFormatter) return existingFormatter

  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone,
  })
  profilePostDateFormatters.set(timeZone, formatter)
  return formatter
}

export function formatProfilePostDate(isoDate: string, timeZone: string) {
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''

  const dateParts = getProfilePostDateFormatter(timeZone).formatToParts(date)
  const day = dateParts.find(({ type }) => type === 'day')?.value
  const month = dateParts.find(({ type }) => type === 'month')?.value.replace('Sept', 'Sep')
  const year = dateParts.find(({ type }) => type === 'year')?.value

  return day && month && year ? `${day} ${month} ${year}` : ''
}
