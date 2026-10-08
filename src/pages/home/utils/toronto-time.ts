export function formatTorontoTime(date: Date, timezone = 'America/Toronto') {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date)
}
