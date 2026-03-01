import { IssuePriority } from '@hcengineering/tracker'

export function parsePriority (value: string | undefined): IssuePriority | undefined {
  if (value === undefined) return undefined
  const map: Record<string, IssuePriority> = {
    no_priority: IssuePriority.NoPriority,
    urgent: IssuePriority.Urgent,
    high: IssuePriority.High,
    medium: IssuePriority.Medium,
    low: IssuePriority.Low
  }
  return map[value.toLowerCase()]
}

export function priorityToString (priority: IssuePriority): string {
  switch (priority) {
    case IssuePriority.NoPriority: return 'No priority'
    case IssuePriority.Urgent: return 'Urgent'
    case IssuePriority.High: return 'High'
    case IssuePriority.Medium: return 'Medium'
    case IssuePriority.Low: return 'Low'
    default: return 'Unknown'
  }
}
