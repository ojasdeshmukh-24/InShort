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
    const parsedDate = new Date(dueDateStr);
    if (!isNaN(parsedDate.getTime())) {
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
