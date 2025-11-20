/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';

import * as SendGrid from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    const from = process.env.SENDGRID_FROM_EMAIL;

    if (!apiKey) {
      throw new Error('SENDGRID_API_KEY is not set');
    }

    if (!from) {
      throw new Error('SENDGRID_FROM_EMAIL is not set');
    }

    SendGrid.setApiKey(apiKey);
  }

  async sendEmail(to: string, subject: string, html: string) {
    try {
      const from = process.env.SENDGRID_FROM_EMAIL as string;

      const msg: SendGrid.MailDataRequired = {
        to,
        from,
        subject,
        html,
      };

      const [response] = await SendGrid.send(msg);

      console.log('Email sent:', {
        statusCode: response.statusCode,
        messageId: response.headers['x-message-id'],
      });

      return {
        statusCode: response.statusCode,
        messageId: response.headers['x-message-id'],
      };
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
    downloadUrl?: string,
    errorDetails?: {
      errorMessage: string;
      suggestion?: string;
      retryAvailable?: boolean;
    },
  ) {
    const subject = `Your ${jobType} job ${status}`;

    const html = this.generateStyledEmail({
      jobType,
      status,
      details,
      downloadUrl,
      errorDetails,
    });

    return this.sendEmail(to, subject, html);
  }

  private generateStyledEmail(data: {
    jobType: string;
    status: 'success' | 'failed';
    details?: string;
    downloadUrl?: string;
    errorDetails?: {
      errorMessage: string;
      suggestion?: string;
      retryAvailable?: boolean;
    };
  }): string {
    const { jobType, status, details, downloadUrl, errorDetails } = data;

    const isSuccess = status === 'success';
    const statusColor = isSuccess ? '#10B981' : '#EF4444';
    const statusIcon = isSuccess ? '✅' : '❌';
    const title = `${statusIcon} Your ${jobType} job has ${status}`;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pixel-Hive Job Notification</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        
        .email-header p {
            opacity: 0.9;
            font-size: 16px;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .status-card {
            background: ${isSuccess ? '#F0FDF4' : '#FEF2F2'};
            border: 1px solid ${isSuccess ? '#BBF7D0' : '#FECACA'};
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            text-align: center;
        }
        
        .status-title {
            font-size: 20px;
            font-weight: 600;
            color: ${statusColor};
            margin-bottom: 8px;
        }
        
        .status-subtitle {
            color: #6B7280;
            font-size: 14px;
        }
        
        .error-section {
            background: #FEF2F2;
            border: 1px solid #FECACA;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        
        .error-title {
            color: #DC2626;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .error-message {
            background: white;
            padding: 12px;
            border-radius: 6px;
            border-left: 4px solid #DC2626;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            color: #7F1D1D;
            margin: 12px 0;
        }
        
        .suggestion-box {
            background: #FFFBEB;
            border: 1px solid #FCD34D;
            border-radius: 6px;
            padding: 12px 16px;
            margin-top: 15px;
        }
        
        .suggestion-title {
            color: #92400E;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .retry-section {
            text-align: center;
            margin: 20px 0;
        }
        
        .retry-button {
            display: inline-block;
            background: #DC2626;
            color: white;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-weight: 600;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .retry-button:hover {
            background: #B91C1C;
        }
        
        .details-section {
            background: #F8FAFC;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
        }
        
        .details-section h3 {
            color: #374151;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
        }
        
        .details-content {
            color: #6B7280;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .download-section {
            text-align: center;
            margin: 30px 0;
        }
        
        .download-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(102, 126, 234, 0.3);
        }
        
        .download-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 8px -1px rgba(102, 126, 234, 0.4);
        }
        
        .thumbnail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 20px 0;
        }
        
        .thumbnail-item {
            background: white;
            border: 1px solid #E5E7EB;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
        }
        
        .thumbnail-image {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin-bottom: 10px;
        }
        
        .thumbnail-link {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
        }
        
        .thumbnail-link:hover {
            text-decoration: underline;
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin: 25px 0;
        }
        
        .info-item {
            background: #F8FAFC;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        
        .info-label {
            font-size: 12px;
            color: #6B7280;
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .info-value {
            font-size: 14px;
            color: #374151;
            font-weight: 500;
        }
        
        .email-footer {
            background: #F8FAFC;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #E5E7EB;
        }
        
        .footer-text {
            color: #6B7280;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .footer-links {
            margin-top: 15px;
        }
        
        .footer-link {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
            margin: 0 10px;
        }
        
        .footer-link:hover {
            text-decoration: underline;
        }
        
        .support-contact {
            background: #EFF6FF;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
            text-align: center;
        }
        
        @media (max-width: 600px) {
            .email-body {
                padding: 25px 20px;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
            }
            
            .thumbnail-grid {
                grid-template-columns: 1fr;
            }
            
            .email-header {
                padding: 25px 20px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Pixel-Hive</h1>
            <p>Your creative workspace in the cloud</p>
        </div>
        
        <div class="email-body">
            <div class="status-card">
                <div class="status-title">${title}</div>
                <div class="status-subtitle">Job completed at ${new Date().toLocaleString()}</div>
            </div>
            
            ${
              !isSuccess && errorDetails
                ? `
            <div class="error-section">
                <div class="error-title">
                    ⚠️ Processing Error
                </div>
                <div class="error-message">
                    ${this.escapeHtml(errorDetails.errorMessage)}
                </div>
                
                ${
                  errorDetails.suggestion
                    ? `
                <div class="suggestion-box">
                    <div class="suggestion-title">💡 Suggestion</div>
                    <div>${this.escapeHtml(errorDetails.suggestion)}</div>
                </div>
                `
                    : ''
                }
                
                ${
                  errorDetails.retryAvailable
                    ? `
                <div class="retry-section">
                    <a href="#" class="retry-button">🔄 Retry Job</a>
                    <p style="margin-top: 8px; color: #6B7280; font-size: 13px;">
                        You can safely retry this job from your dashboard.
                    </p>
                </div>
                `
                    : ''
                }
            </div>
            `
                : ''
            }
            
            ${
              isSuccess && downloadUrl
                ? `
            <div class="download-section">
                <a href="${this.escapeHtml(downloadUrl)}" class="download-button" target="_blank">
                    📥 Download Your File
                </a>
                <p style="margin-top: 12px; color: #6B7280; font-size: 14px;">
                    Your file is ready for download. Click the button above to get your processed file.
                </p>
            </div>
            `
                : ''
            }
            
            ${
              details
                ? `
            <div class="details-section">
                <h3>📋 Job Details</h3>
                <div class="details-content">${details}</div>
            </div>
            `
                : ''
            }
            
            <div class="info-grid">
                <div class="info-item">
                    <div class="info-label">Job Type</div>
                    <div class="info-value">${this.escapeHtml(jobType)}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Status</div>
                    <div class="info-value" style="color: ${statusColor};">${status}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Date</div>
                    <div class="info-value">${new Date().toLocaleDateString()}</div>
                </div>
                <div class="info-item">
                    <div class="info-label">Time</div>
                    <div class="info-value">${new Date().toLocaleTimeString()}</div>
                </div>
            </div>
            
            ${
              !isSuccess
                ? `
            <div class="support-contact">
                <strong>Need Help?</strong>
                <p style="margin-top: 8px; font-size: 14px; color: #6B7280;">
                    If this error persists, please contact our support team with the job details above.
                </p>
            </div>
            `
                : ''
            }
        </div>
        
        <div class="email-footer">
            <p class="footer-text">Thank you for using Pixel-Hive!</p>
            <p class="footer-text">If you have any questions, feel free to reach out to our support team.</p>
            
            <div class="footer-links">
                <a href="#" class="footer-link">Support</a>
                <a href="#" class="footer-link">Documentation</a>
                <a href="#" class="footer-link">Privacy Policy</a>
            </div>
            
            <p class="footer-text" style="margin-top: 20px; font-size: 12px;">
                &copy; ${new Date().getFullYear()} Pixel-Hive. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
    `;
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Specialized email templates for different job types with error handling
  async sendPdfJobEmail(
    to: string,
    status: 'success' | 'failed',
    downloadUrl?: string,
    details?: string,
    errorMessage?: string,
  ) {
    const errorDetails =
      status === 'failed'
        ? {
            errorMessage:
              errorMessage || 'Unknown error occurred during PDF processing',
            suggestion:
              'Please check your input file format and try again. Supported formats: text, HTML, images.',
            retryAvailable: true,
          }
        : undefined;

    return this.sendJobStatusEmail(
      to,
      'PDF Processing',
      status,
      details,
      downloadUrl,
      errorDetails,
    );
  }

  async sendQrJobEmail(
    to: string,
    type: 'generate' | 'decode',
    status: 'success' | 'failed',
    result?: { url?: string; decoded?: string },
    details?: string,
    errorMessage?: string,
  ) {
    const jobType = `QR Code ${type === 'generate' ? 'Generation' : 'Decoding'}`;
    const downloadUrl = result?.url;

    let enhancedDetails = details || '';
    if (status === 'success' && result?.decoded) {
      enhancedDetails += `<br><br><strong>Decoded Content:</strong><br><code style="background: #F3F4F6; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 8px;">${this.escapeHtml(result.decoded)}</code>`;
    }

    const errorDetails =
      status === 'failed'
        ? {
            errorMessage: errorMessage || `QR Code ${type} failed`,
            suggestion:
              type === 'generate'
                ? 'Please ensure your input data is valid and not too long.'
                : 'Please ensure the image contains a clear QR code and is in a supported format.',
            retryAvailable: true,
          }
        : undefined;

    return this.sendJobStatusEmail(
      to,
      jobType,
      status,
      enhancedDetails,
      downloadUrl,
      errorDetails,
    );
  }

  async sendVideoJobEmail(
    to: string,
    status: 'success' | 'failed',
    thumbnails?: string[],
    details?: string,
    errorMessage?: string,
  ) {
    let enhancedDetails = details || '';

    if (status === 'success' && thumbnails && thumbnails.length > 0) {
      // Create proper HTML for thumbnails
      const thumbnailsHtml = thumbnails
        .map(
          (url, index) => `
        <div class="thumbnail-item">
          <img src="${this.escapeHtml(url)}" alt="Thumbnail ${index + 1}" class="thumbnail-image">
          <br>
          <a href="${this.escapeHtml(url)}" class="thumbnail-link" target="_blank">
            Download Thumbnail ${index + 1}
          </a>
        </div>
      `,
        )
        .join('');

      enhancedDetails += `
        <br><br>
        <strong>Generated Thumbnails:</strong>
        <div class="thumbnail-grid">
          ${thumbnailsHtml}
        </div>
      `;
    }

    const errorDetails =
      status === 'failed'
        ? {
            errorMessage: errorMessage || 'Video thumbnail generation failed',
            suggestion:
              'Please check that your video file is in a supported format and not corrupted.',
            retryAvailable: true,
          }
        : undefined;

    return this.sendJobStatusEmail(
      to,
      'Video Thumbnail Generation',
      status,
      enhancedDetails,
      undefined, // No main download URL for video thumbnails
      errorDetails,
    );
  }

  async sendWatermarkJobEmail(
    to: string,
    status: 'success' | 'failed',
    inputUrl?: string,
    outputUrl?: string,
    details?: string,
    errorMessage?: string,
  ) {
    let enhancedDetails = details || '';

    if (status === 'success' && inputUrl && outputUrl) {
      enhancedDetails += `
        <div style="margin: 15px 0;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div style="text-align: center;">
              <strong>Original File</strong><br>
              <a href="${this.escapeHtml(inputUrl)}" target="_blank" style="color: #667eea; text-decoration: none;">View Original</a>
            </div>
            <div style="text-align: center;">
              <strong>Watermarked File</strong><br>
              <a href="${this.escapeHtml(outputUrl)}" target="_blank" style="color: #667eea; text-decoration: none;">Download Result</a>
            </div>
          </div>
        </div>
      `;
    }

    const errorDetails =
      status === 'failed'
        ? {
            errorMessage: errorMessage || 'Watermark application failed',
            suggestion:
              'Please check that your input file and watermark settings are valid. Supported formats: images and PDFs.',
            retryAvailable: true,
          }
        : undefined;

    return this.sendJobStatusEmail(
      to,
      'File Watermarking',
      status,
      enhancedDetails,
      outputUrl,
      errorDetails,
    );
  }
}
