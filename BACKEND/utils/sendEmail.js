const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await fetch(process.env.APPS_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("Email sending failed:", data);
      throw new Error(data.message || "Email sending failed");
    }

    console.log("Email sent successfully");

    return data;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};

module.exports = sendEmail;