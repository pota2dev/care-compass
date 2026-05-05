import nodemailer from "nodemailer";

export async function sendVaccinationReminder(email: string, petName: string, vaccineName: string, dueDate: Date) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2b5c42;">Pet CareCompass - Vaccination Reminder</h2>
      <p>Hello!</p>
      <p>This is a friendly reminder that <b>${petName}</b> is due for their <b>${vaccineName}</b> vaccination soon.</p>
      <p><b>Due Date:</b> ${formatter.format(dueDate)}</p>
      <p>Keeping up with vaccinations is crucial for your pet's long-term health and well-being. Please remember to schedule an appointment with your vet.</p>
      <br/>
      <p>Best regards,</p>
      <p>The Pet CareCompass Team</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Pet CareCompass" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `🐾 Vaccination Reminder for ${petName}!`,
      html: htmlContent,
    });
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}
