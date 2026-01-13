import httpStatus from "http-status-codes";
/* eslint-disable @typescript-eslint/no-explicit-any */
import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";


import { envVariables } from "../../config/env";
import AppError from "../../errorHelpers/AppError";

/**
 * Configure SMTP transporter
 */
const transporter = nodemailer.createTransport({
  host: envVariables.SMTP_HOST,
  port: Number(envVariables.SMTP_PORT),
  secure: true, // true if using 465
  auth: {
    user: envVariables.SMTP_USER,
    pass: envVariables.SMTP_PASS,
  },
});

interface IContactForm {
  name: string;
  email: string; // user email (sender)
  subject?: string; // optional
  message: string;
  attachments?: {
    filename: string;
    content: Buffer | string;
    contentType: string;
  }[];
}

/**
 * Service function to send email
 */
const sendContactEmail = async (payload: IContactForm) => {
  try {
    const templatePath = path.join(__dirname, `templates/contactForm.ejs`);
    console.log(templatePath);

    // Render HTML using EJS
    const html = await ejs.renderFile(templatePath, payload);

    const info = await transporter.sendMail({
      from: envVariables.SMTP_FROM, // verified SMTP
      to: envVariables.SMTP_USER, // your portfolio email
      subject: payload.subject || "New Contact Form Submission",
      replyTo: payload.email,
      html,
      attachments: payload.attachments?.map((item) => ({
        filename: item.filename,
        content: item.content,
        contentType: item.contentType,
      })),
    });

    console.log(`📩 Contact form email sent: ${info.messageId}`);
    return { messageId: info.messageId };
  } catch (err: any) {
    console.error("FULL EMAIL ERROR 👇");
    console.error(err);
    throw new AppError(
      httpStatus.BAD_REQUEST,
      err.message || "Unable to send email"
    );
  }

};

export const contactService = {
  sendContactEmail,
};
