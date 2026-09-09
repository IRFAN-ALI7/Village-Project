const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: `"Digital Village Project, Jharkhand" <onboarding@resend.dev>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email sending failed:", error);
      throw error;
    }

    console.log("Email sent:", data.id);

    return data;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = sendEmail;