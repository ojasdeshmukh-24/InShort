/**
 * Parses natural deadline strings like "Tomorrow, 9:00 AM", "Today, 6:00 PM",
 * "November 5th, 2026", "23 October" into a valid Date object.
 */
export function parseDeadlineDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const lower = dateStr.toLowerCase();
  const targetDate = new Date();
  let hasRelative = false;

  if (lower.includes('tomorrow')) {
    targetDate.setDate(targetDate.getDate() + 1);
    hasRelative = true;
  } else if (lower.includes('today')) {
    hasRelative = true;
  }

  // Extract explicit time if present (e.g., 9:00 AM, 6:00 PM, 11:59 PM)
  const timeMatch = dateStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const isPM = timeMatch[3].toUpperCase() === 'PM';
    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;
    targetDate.setHours(hours, minutes, 0, 0);
  } else if (hasRelative) {
    // Default to 9:00 AM for relative days with no explicit time
    targetDate.setHours(9, 0, 0, 0);
  }

  if (hasRelative) return targetDate;

  // Clean ordinal suffixes like "5th", "21st", "2nd" -> "5", "21", "2"
  const cleaned = dateStr.replace(/(\d+)(?:st|nd|rd|th)/gi, '$1');
  const parsed = new Date(cleaned);
  if (!isNaN(parsed.getTime())) return parsed;

  return null;
}

/**
 * Generates an instant, pre-filled Google Calendar event URL
 */
export function createGoogleCalendarUrl(
  title: string,
  details: string,
  dueDateStr?: string,
  meetingUrl?: string
): string {
  const baseUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';

  let datesParam = '';
  if (dueDateStr) {
    const parsedDate = parseDeadlineDate(dueDateStr);
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      // Event for 1 hour duration at the due time, or all-day if no time specified
      const start = parsedDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
      const endDate = new Date(parsedDate.getTime() + 60 * 60 * 1000);
      const end = endDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
      datesParam = `&dates=${start}/${end}`;
    }
  }

  let fullDetails = details;
  if (meetingUrl) {
    fullDetails += `\n\nMeeting Link: ${meetingUrl}`;
  }
  fullDetails += '\n\n— Extracted by AcadMail AI';

  const params = new URLSearchParams({
    text: `[AcadMail] ${title}`,
    details: fullDetails,
    ...(meetingUrl ? { location: meetingUrl } : {}),
  });

  return `${baseUrl}&${params.toString()}${datesParam}`;
}
