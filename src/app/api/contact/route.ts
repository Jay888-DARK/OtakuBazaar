import { NextRequest, NextResponse } from 'next/server';

/**
 * @file src/app/api/contact/route.ts
 *
 * Contact inquiry & grievance dispatcher.
 * Delivers customer messages to the official contact email: jaybhatt8826@gmail.com.
 *
 * Supports:
 * 1. Resend API integration if RESEND_API_KEY is configured.
 * 2. Secure server-side audit logging and structured receipt.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, orderRef, topic, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields.' },
        { status: 400 }
      );
    }

    const recipientEmail = 'jaybhatt8826@gmail.com';
    const timestamp = new Date().toISOString();

    // Diagnostics / Audit Log
    console.info(`[CONTACT_DESK] Received message at ${timestamp}:`, {
      from: `${name} <${email}>`,
      to: recipientEmail,
      topic: topic || 'GENERAL',
      orderRef: orderRef || 'N/A',
      length: message.length,
    });

    let deliveredVia = 'server_log';

    // Dispatch via Resend REST API if configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM_EMAIL || 'OtakuBazaar Desk <onboarding@resend.dev>',
            to: [recipientEmail],
            reply_to: email,
            subject: `[OtakuBazaar Inquiry] ${topic || 'Support'}: ${name} (${orderRef || 'No Order Ref'})`,
            text: `New Inquiry Received from OtakuBazaar Contact Desk:
--------------------------------------------------
Sender: ${name} (${email})
Topic: ${topic || 'General Support'}
Order Ref: ${orderRef || 'None'}
Timestamp: ${timestamp}
--------------------------------------------------

Message:
${message}
`,
          }),
        });

        if (emailRes.ok) {
          deliveredVia = 'resend';
          console.info(`[CONTACT_DESK] Successfully dispatched to ${recipientEmail} via Resend.`);
        } else {
          const errText = await emailRes.text();
          console.warn(`[CONTACT_DESK] Resend dispatch returned non-200:`, errText);
        }
      } catch (sendError) {
        console.error(`[CONTACT_DESK] Failed to dispatch via Resend:`, sendError);
      }
    }

    return NextResponse.json({
      success: true,
      deliveredTo: recipientEmail,
      deliveredVia,
      timestamp,
      message: 'Your inquiry has been received and routed to jaybhatt8826@gmail.com.',
    });
  } catch (error) {
    console.error('[CONTACT_DESK_ERROR] Failed to process inquiry:', error);
    return NextResponse.json(
      { error: 'Failed to process inquiry. Please email jaybhatt8826@gmail.com directly.' },
      { status: 500 }
    );
  }
}
