// ─── Library Due-Date Email Reminder ─────────────────────────────
// This script is run daily by GitHub Actions.
// It queries Supabase for books due TOMORROW and sends reminder
// emails to each member via Resend.
// ──────────────────────────────────────────────────────────────────

const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_API_KEY   = process.env.RESEND_API_KEY;

async function run() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !RESEND_API_KEY) {
    console.error('❌ Missing environment variables. Check GitHub Secrets.');
    process.exit(1);
  }

  // ── 1. Calculate tomorrow's date in YYYY-MM-DD format
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  console.log(`📅 Checking for books due on: ${tomorrowStr}`);

  // ── 2. Query Supabase for active lendings due tomorrow
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/lendings?select=*,book:books(title,author),member:profiles(name,email)&due_date=eq.${tomorrowStr}&status=eq.active`,
    {
      headers: {
        'apikey':        SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type':  'application/json',
      }
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error('❌ Supabase query failed:', err);
    process.exit(1);
  }

  const lendings = await response.json();
  console.log(`📚 Found ${lendings.length} lending(s) due tomorrow.`);

  if (lendings.length === 0) {
    console.log('✅ No reminders to send today.');
    return;
  }

  // ── 3. Send a reminder email for each member
  let sent = 0;
  for (const lending of lendings) {
    const memberName  = lending.member?.name  || 'Member';
    const memberEmail = lending.member?.email;
    const bookTitle   = lending.book?.title   || 'your book';
    const bookAuthor  = lending.book?.author  || '';

    if (!memberEmail) {
      console.warn(`⚠️  No email for member: ${memberName}, skipping.`);
      continue;
    }

    const emailHtml = `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <div style="background: #2563EB; border-radius: 10px 10px 0 0; padding: 20px 28px;">
          <h1 style="color: white; font-size: 18px; margin: 0;">📚 LibraryMS</h1>
        </div>
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px; padding: 28px;">
          <p style="font-size: 15px; color: #1e293b;">Hi <strong>${memberName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.6;">
            This is a friendly reminder that your borrowed book is due for return <strong>tomorrow</strong>:
          </p>
          <div style="background: #eff6ff; border-left: 4px solid #2563eb; border-radius: 6px; padding: 14px 18px; margin: 20px 0;">
            <div style="font-size: 16px; font-weight: 600; color: #1e293b;">${bookTitle}</div>
            ${bookAuthor ? `<div style="font-size: 13px; color: #64748b; margin-top: 3px;">by ${bookAuthor}</div>` : ''}
            <div style="font-size: 13px; color: #2563eb; margin-top: 8px; font-weight: 500;">Due: ${tomorrowStr}</div>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            Please return the book to the library by tomorrow to avoid any late fees.<br>
            A fine of <strong>₹5 per day</strong> is charged for overdue books.
          </p>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">— LibraryMS Team</p>
        </div>
      </div>
    `;

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        from:    'LibraryMS <onboarding@resend.dev>',
        to:      [memberEmail],
        subject: `📚 Reminder: "${bookTitle}" is due tomorrow!`,
        html:    emailHtml,
      })
    });

    if (emailRes.ok) {
      console.log(`✅ Sent reminder to ${memberEmail} for "${bookTitle}"`);
      sent++;
    } else {
      const errBody = await emailRes.text();
      console.error(`❌ Failed to email ${memberEmail}:`, errBody);
    }
  }

  console.log(`\n✅ Done! Sent ${sent}/${lendings.length} reminder(s).`);
}

run().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
