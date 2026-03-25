import Resend from "resend";

const resend = new Resend("YOUR_API_KEY");

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const response = await resend.sendEmail({
      from: "noreply@syedom.com",
      to,
      subject,
      html,
    });
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};