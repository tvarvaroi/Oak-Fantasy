import { getUser } from '@/lib/auth/get-user';
import { fetchSubscribers, formatSubscriberDate } from '@/lib/admin/subscribers';

// CSV export of subscribers (Task 2.5). Route handler so the browser downloads
// directly via the link's href (Content-Disposition: attachment).
//
// SECURITY: route handlers are NOT wrapped by the (protected) layout gate
// (layouts don't run for route handlers — Task 2.3 lesson). Gate explicitly
// here; a non-admin gets a generic 404, never the data.

export const dynamic = 'force-dynamic';

// RFC-4180 escaping: wrap in quotes if the value has a comma, quote or newline;
// double any embedded quotes.
function csvCell(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export async function GET() {
  const user = await getUser();
  if (!user || user.role !== 'admin') {
    return new Response('Not found', { status: 404 });
  }

  const subscribers = await fetchSubscribers();

  const header = ['email', 'data', 'language', 'source'];
  const lines = subscribers.map((s) =>
    [s.email, formatSubscriberDate(s.created_at), s.language, s.source].map(csvCell).join(','),
  );

  // Leading BOM so Excel reads UTF-8 (diacritics safe); CRLF line endings for
  // Excel compatibility. fromCharCode keeps the source ASCII (no literal BOM).
  const BOM = String.fromCharCode(0xfeff);
  const csv = BOM + [header.join(','), ...lines].join('\r\n');

  const stamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const filename = `subscribers-oak-fantasy-${stamp}.csv`;

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
