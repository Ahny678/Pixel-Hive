import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Pixel-Hive" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log('Email sent:', info.messageId);
    } catch (err) {
      console.error('Failed to send email', err);
      throw new InternalServerErrorException('Failed to send email');
    }
  }

  async sendJobStatusEmail(
    to: string,
    jobType: string,
    status: 'success' | 'failed',
    details?: string,
  ) {
    const subject = `Your ${jobType} job ${status}`;
    const html = `
      <p>Hello,</p>
      <p>Your ${jobType} job has completed with status: <b>${status}</b>.</p>
      ${details ? `<p>Details: ${details}</p>` : ''}
      <p>Thank you for using Pixel-Hive!</p>
    `;
    return this.sendEmail(to, subject, html);
  }
}
