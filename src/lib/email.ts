import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy_placeholder_for_build");

const FROM = "Pet CareCompass <notifications@carecompass.com>";
// During dev/testing with Resend free tier you can use:
// "Pet CareCompass <onboarding@resend.dev>"

// ─────────────────────────────────────────────────────────────
// SHARED: styled HTML wrapper
// ─────────────────────────────────────────────────────────────
function emailWrapper(content: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Pet CareCompass</title>
</head>
<body style="margin:0;padding:0;background-color:#FAF7F2;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F2;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#2D5016;border-radius:16px 16px 0 0;padding:28px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-size:28px;">🐾</span>
                    <span style="color:#ffffff;font-size:20px;font-weight:700;margin-left:10px;vertical-align:middle;">
                      Pet CareCompass
                    </span>
                  </td>
                  <td align="right">
                    <span style="color:rgba(255,255,255,0.6);font-size:12px;">Bangladesh&apos;s Pet Platform</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:32px;border-left:1px solid #E8F0DE;border-right:1px solid #E8F0DE;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F2F7EC;border-radius:0 0 16px 16px;padding:20px 32px;
              border:1px solid #E8F0DE;border-top:none;text-align:center;">
              <p style="margin:0;color:#8A9480;font-size:12px;">
                © 2025 Pet CareCompass · Bangladesh&apos;s Complete Pet Care Platform
              </p>
              <p style="margin:6px 0 0;color:#8A9480;font-size:11px;">
                You are receiving this because you have an account on CareCompass.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─────────────────────────────────────────────────────────────
// SHARED: button component
// ─────────────────────────────────────────────────────────────
function emailButton(text: string, url: string) {
  return `
  <div style="text-align:center;margin:24px 0;">
    <a href="${url}" style="
      display:inline-block;background:#2D5016;color:#ffffff;
      text-decoration:none;padding:14px 32px;border-radius:25px;
      font-size:14px;font-weight:600;letter-spacing:0.3px;
    ">${text}</a>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// SHARED: info row
// ─────────────────────────────────────────────────────────────
function infoRow(label: string, value: string) {
  return `
  <tr>
    <td style="padding:8px 0;color:#8A9480;font-size:13px;width:40%;">${label}</td>
    <td style="padding:8px 0;color:#2D5016;font-size:13px;font-weight:500;">${value}</td>
  </tr>`;
}

// ─────────────────────────────────────────────────────────────
// SHARED: section header
// ─────────────────────────────────────────────────────────────
function sectionHeader(emoji: string, title: string, subtitle: string, color = "#2D5016") {
  return `
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-size:48px;margin-bottom:12px;">${emoji}</div>
    <h1 style="margin:0;color:${color};font-size:24px;font-weight:700;">${title}</h1>
    <p style="margin:8px 0 0;color:#8A9480;font-size:14px;">${subtitle}</p>
  </div>`;
}

// ─────────────────────────────────────────────────────────────
// 1. BOOKING CONFIRMATION
// ─────────────────────────────────────────────────────────────
export async function sendBookingConfirmationEmail({
  to, userName, petName, serviceType, providerName,
  providerAddress, dateTime, bookingId, isHomeService, homeAddress,
}: {
  to: string;
  userName: string;
  petName: string;
  serviceType: string;
  providerName: string;
  providerAddress: string;
  dateTime: string;
  bookingId: string;
  isHomeService?: boolean;
  homeAddress?: string;
}) {
  const serviceEmoji: Record<string, string> = {
    VET_APPOINTMENT: "🏥", GROOMING: "✂️", DAYCARE: "🏡",
  };

  const content = `
    ${sectionHeader("✅", "Booking Confirmed!", `Your ${serviceType.replace("_", " ").toLowerCase()} has been booked`)}

    <p style="color:#4A7C28;font-size:15px;margin:0 0 20px;">Hi ${userName},</p>
    <p style="color:#4A7C28;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Great news! Your booking for <strong>${petName}</strong> has been confirmed.
      Here are your booking details:
    </p>

    <div style="background:#F2F7EC;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Booking ID", `#${bookingId.slice(-8).toUpperCase()}`)}
        ${infoRow("Service", `${serviceEmoji[serviceType] ?? "📅"} ${serviceType.replace("_", " ")}`)}
        ${infoRow("Pet", petName)}
        ${infoRow("Provider", providerName)}
        ${infoRow("Date & Time", dateTime)}
        ${infoRow("Location", isHomeService ? `🏠 Home Service — ${homeAddress}` : providerAddress)}
      </table>
    </div>

    ${isHomeService ? `
    <div style="background:#FDF0D5;border-radius:10px;padding:14px 18px;margin:0 0 20px;border-left:4px solid #C47A10;">
      <p style="margin:0;color:#C47A10;font-size:13px;font-weight:600;">🏠 Home Service Reminder</p>
      <p style="margin:6px 0 0;color:#8A5C00;font-size:13px;">
        Our groomer will visit you at: <strong>${homeAddress}</strong><br/>
        Please ensure someone is home at the scheduled time.
      </p>
    </div>` : ""}

    <div style="background:#F2F7EC;border-radius:10px;padding:14px 18px;margin:0 0 20px;">
      <p style="margin:0;color:#2D5016;font-size:13px;font-weight:600;">📌 What to bring / prepare</p>
      <ul style="margin:8px 0 0;padding-left:18px;color:#4A7C28;font-size:13px;line-height:1.8;">
        <li>Vaccination records for ${petName}</li>
        <li>Any medications ${petName} is currently taking</li>
        <li>Arrive 5 minutes early</li>
      </ul>
    </div>

    ${emailButton("View My Bookings →", `${process.env.NEXT_PUBLIC_APP_URL}/bookings`)}
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `✅ Booking Confirmed — ${serviceType.replace("_", " ")} for ${petName}`,
    html: emailWrapper(content),
  });
}

// ─────────────────────────────────────────────────────────────
// 2. BOOKING REMINDER (sent 24h before)
// ─────────────────────────────────────────────────────────────
export async function sendBookingReminderEmail({
  to, userName, petName, serviceType,
  providerName, dateTime, bookingId,
}: {
  to: string;
  userName: string;
  petName: string;
  serviceType: string;
  providerName: string;
  dateTime: string;
  bookingId: string;
}) {
  const content = `
    ${sectionHeader("⏰", "Appointment Tomorrow!", `Don't forget — ${petName}'s appointment is coming up`)}

    <p style="color:#4A7C28;font-size:15px;margin:0 0 20px;">Hi ${userName},</p>
    <p style="color:#4A7C28;font-size:14px;line-height:1.6;margin:0 0 24px;">
      This is a friendly reminder that <strong>${petName}</strong> has a
      <strong>${serviceType.replace("_", " ").toLowerCase()}</strong> appointment tomorrow.
    </p>

    <div style="background:#F2F7EC;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Booking ID", `#${bookingId.slice(-8).toUpperCase()}`)}
        ${infoRow("Service", serviceType.replace("_", " "))}
        ${infoRow("Pet", petName)}
        ${infoRow("Provider", providerName)}
        ${infoRow("Date & Time", dateTime)}
      </table>
    </div>

    ${emailButton("View Booking Details →", `${process.env.NEXT_PUBLIC_APP_URL}/bookings`)}
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `⏰ Reminder — ${petName}'s appointment is tomorrow!`,
    html: emailWrapper(content),
  });
}

// ─────────────────────────────────────────────────────────────
// 3. ORDER CONFIRMATION
// ─────────────────────────────────────────────────────────────
export async function sendOrderConfirmationEmail({
  to, userName, orderId, items, totalAmount, shippingAddress,
}: {
  to: string;
  userName: string;
  orderId: string;
  items: { name: string; quantity: number; unitPrice: number }[];
  totalAmount: number;
  shippingAddress: string;
}) {
  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;color:#2D5016;font-size:13px;border-bottom:1px solid #E8F0DE;">
        ${item.name}
      </td>
      <td style="padding:10px 0;color:#8A9480;font-size:13px;text-align:center;border-bottom:1px solid #E8F0DE;">
        × ${item.quantity}
      </td>
      <td style="padding:10px 0;color:#2D5016;font-size:13px;font-weight:600;text-align:right;border-bottom:1px solid #E8F0DE;">
        ৳ ${(item.quantity * item.unitPrice).toLocaleString()}
      </td>
    </tr>
  `).join("");

  const content = `
    ${sectionHeader("📦", "Order Placed!", "Your order is confirmed and being prepared")}

    <p style="color:#4A7C28;font-size:15px;margin:0 0 20px;">Hi ${userName},</p>
    <p style="color:#4A7C28;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Thank you for your order! We've received your purchase and it will be
      delivered to you within <strong>2–5 hours</strong>.
    </p>

    <!-- Order ID badge -->
    <div style="text-align:center;margin:0 0 24px;">
      <div style="display:inline-block;background:#F2F7EC;border-radius:25px;
        padding:8px 20px;border:1px solid #C8DFB0;">
        <span style="color:#8A9480;font-size:12px;">Order ID: </span>
        <span style="color:#2D5016;font-size:14px;font-weight:700;">
          #${orderId.slice(-8).toUpperCase()}
        </span>
      </div>
    </div>

    <!-- Items table -->
    <div style="background:#F2F7EC;border-radius:12px;padding:20px;margin:0 0 20px;">
      <p style="margin:0 0 12px;color:#2D5016;font-size:13px;font-weight:600;">🛒 Items Ordered</p>
      <table width="100%" cellpadding="0" cellspacing="0">
        ${itemRows}
        <tr>
          <td colspan="2" style="padding:12px 0 0;color:#2D5016;font-size:15px;font-weight:700;">Total</td>
          <td style="padding:12px 0 0;color:#2D5016;font-size:15px;font-weight:700;text-align:right;">
            ৳ ${totalAmount.toLocaleString()}
          </td>
        </tr>
      </table>
    </div>

    <!-- Delivery address -->
    <div style="background:#F2F7EC;border-radius:10px;padding:14px 18px;margin:0 0 24px;">
      <p style="margin:0;color:#2D5016;font-size:13px;font-weight:600;">🚚 Delivery Address</p>
      <p style="margin:6px 0 0;color:#4A7C28;font-size:13px;">${shippingAddress}</p>
      <p style="margin:8px 0 0;color:#8A9480;font-size:12px;">
        Expected delivery: 2–5 hours from now · Cash on delivery
      </p>
    </div>

    ${emailButton("Track My Order →", `${process.env.NEXT_PUBLIC_APP_URL}/shop/orders/${orderId}`)}
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `📦 Order Confirmed — #${orderId.slice(-8).toUpperCase()} · ৳ ${totalAmount.toLocaleString()}`,
    html: emailWrapper(content),
  });
}

// ─────────────────────────────────────────────────────────────
// 4. ORDER DELIVERED
// ─────────────────────────────────────────────────────────────
export async function sendOrderDeliveredEmail({
  to, userName, orderId, totalAmount,
}: {
  to: string;
  userName: string;
  orderId: string;
  totalAmount: number;
}) {
  const content = `
    ${sectionHeader("✅", "Order Delivered!", "Your order has arrived", "#2D5016")}

    <p style="color:#4A7C28;font-size:15px;margin:0 0 20px;">Hi ${userName},</p>
    <p style="color:#4A7C28;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Great news! Your order <strong>#${orderId.slice(-8).toUpperCase()}</strong> has been
      delivered successfully. We hope your pet loves their new items! 🐾
    </p>

    <div style="background:#F2F7EC;border-radius:12px;padding:20px;margin:0 0 24px;text-align:center;">
      <p style="font-size:36px;margin:0 0 8px;">🎉</p>
      <p style="color:#2D5016;font-size:16px;font-weight:700;margin:0;">
        ৳ ${totalAmount.toLocaleString()} — Delivered
      </p>
    </div>

    <p style="color:#8A9480;font-size:13px;text-align:center;margin:0 0 20px;">
      Enjoying your purchase? Leave a review to help other pet owners!
    </p>

    ${emailButton("Shop Again →", `${process.env.NEXT_PUBLIC_APP_URL}/shop`)}
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `✅ Delivered — Order #${orderId.slice(-8).toUpperCase()}`,
    html: emailWrapper(content),
  });
}

// ─────────────────────────────────────────────────────────────
// 5. RESCUE REPORT SUBMITTED
// ─────────────────────────────────────────────────────────────
export async function sendRescueConfirmationEmail({
  to, userName, reportId, animalType, condition,
  urgency, location, description,
}: {
  to: string;
  userName: string;
  reportId: string;
  animalType: string;
  condition: string;
  urgency: string;
  location: string;
  description?: string;
}) {
  const urgencyColor: Record<string, string> = {
    LOW: "#4A7C28", MEDIUM: "#C47A10", HIGH: "#C8593A", CRITICAL: "#DC2626",
  };
  const urgencyBg: Record<string, string> = {
    LOW: "#F2F7EC", MEDIUM: "#FDF0D5", HIGH: "#F9EDE8", CRITICAL: "#FEE2E2",
  };
  const color = urgencyColor[urgency] ?? "#C47A10";
  const bg    = urgencyBg[urgency]    ?? "#FDF0D5";

  const content = `
    ${sectionHeader("🚨", "Rescue Report Received", "Our rescue network has been notified", "#C8593A")}

    <p style="color:#4A7C28;font-size:15px;margin:0 0 20px;">Hi ${userName},</p>
    <p style="color:#4A7C28;font-size:14px;line-height:1.6;margin:0 0 24px;">
      Thank you for reporting this animal. Your rescue request has been submitted
      and our network of rescue organizations has been alerted immediately.
    </p>

    <!-- Urgency badge -->
    <div style="text-align:center;margin:0 0 20px;">
      <span style="display:inline-block;background:${bg};color:${color};
        padding:6px 18px;border-radius:20px;font-size:13px;font-weight:600;">
        🔴 Urgency: ${urgency}
      </span>
    </div>

    <div style="background:#F2F7EC;border-radius:12px;padding:20px;margin:0 0 20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        ${infoRow("Report ID", `#${reportId.slice(-8).toUpperCase()}`)}
        ${infoRow("Animal", animalType)}
        ${infoRow("Condition", condition)}
        ${infoRow("Location", location)}
        ${description ? infoRow("Description", description) : ""}
      </table>
    </div>

    <div style="background:#FDF0D5;border-radius:10px;padding:14px 18px;margin:0 0 20px;border-left:4px solid #C47A10;">
      <p style="margin:0;color:#C47A10;font-size:13px;font-weight:600;">⏱️ What happens next?</p>
      <ul style="margin:8px 0 0;padding-left:18px;color:#8A5C00;font-size:13px;line-height:1.8;">
        <li>Rescue teams in your area have been notified</li>
        <li>A team will be dispatched to the location</li>
        <li>You can track the status in your dashboard</li>
        <li>For emergencies, call our hotline directly</li>
      </ul>
    </div>

    ${emailButton("View Report Status →", `${process.env.NEXT_PUBLIC_APP_URL}/rescue`)}
  `;

  return resend.emails.send({
    from: FROM,
    to,
    subject: `🚨 Rescue Report #${reportId.slice(-8).toUpperCase()} — ${animalType} in ${urgency} urgency`,
    html: emailWrapper(content),
  });
}
