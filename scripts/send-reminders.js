const SUPABASE_URL     = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const RESEND_API_KEY   = process.env.RESEND_API_KEY;

async function run() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !RESEND_API_KEY) {
    console.error('❌ Missing environment variables. Check GitHub Secrets.');
    process.exit(1);
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  console.log(`📅 Checking for books due on: ${tomorrowStr}`);

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
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563EB;">📚 LibraryMS Due Reminder</h2>
        <p>Hi <strong>${memberName}</strong>,</p>
        <p>This is a reminder that <strong>${bookTitle}</strong> is due for return <strong>tomorrow (${tomorrowStr})</strong>.</p>
        <p>To avoid late fees (₹5/day), please return it to the library by tomorrow.</p>
        <p>Thank you!</p>
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
      console.log(`✅ Sent reminder to ${memberEmail}`);
      sent++;
    }
  }
  console.log(`Done! Sent ${sent} reminder(s).`);
}

run().catch(err => { console.error(err); process.exit(1); });
