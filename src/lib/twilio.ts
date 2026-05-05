import Twilio from "twilio";

const client = Twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSMS(to: string, body: string) {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER!,
      to,
    });
    return { success: true, sid: message.sid };
  } catch (error) {
    console.error("Twilio SMS error:", error);
    return { success: false, error };
  }
}

export async function sendBookingConfirmationSMS(
  phone: string,
  petName: string,
  serviceName: string,
  dateTime: string
) {
  return sendSMS(
    phone,
    `🐾 PetCareCompass: Your ${serviceName} appointment for ${petName} is confirmed on ${dateTime}. Reply CANCEL to cancel.`
  );
}

export async function sendHealthReminderSMS(
  phone: string,
  petName: string,
  reminderType: string
) {
  return sendSMS(
    phone,
    `🐾 PetCareCompass Reminder: ${petName}'s ${reminderType} is due soon. Book an appointment at carecompass.com`
  );
}
