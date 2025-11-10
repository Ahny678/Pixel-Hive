import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import { PDFDocument, rgb } from 'pdf-lib';
import fetch, { Response } from 'node-fetch';
import * as fs from 'fs/promises';

interface WatermarkJob {
  fileUrl: string;
  fileType: 'image' | 'pdf';
  watermarkType: 'text' | 'image';
  watermarkText?: string;
  watermarkImage?: string;
  position?: string;
  opacity?: number;
  fontSize?: number;
}

@Injectable()
export class WatermarkProcessorHelper {
  async applyWatermark(job: WatermarkJob): Promise<string> {
    const {
      fileUrl,
      fileType,
      watermarkType,
      watermarkText,
      watermarkImage,
      position = 'bottom-right',
      opacity = 0.7,
      fontSize = 24,
    } = job;

    console.log(`[WatermarkHelper] Applying watermark:`, {
      fileType,
      watermarkType,
      position,
      opacity,
      fontSize,
    });

    if (fileType === 'image') {
      return this.applyImageWatermark(
        fileUrl,
        watermarkType,
        watermarkText,
        watermarkImage,
        position,
        opacity,
        fontSize,
      );
    } else if (fileType === 'pdf') {
      return this.applyPdfWatermark(
        fileUrl,
        watermarkType,
        watermarkText,
        watermarkImage,
        position,
        opacity,
        fontSize,
      );
    } else {
      throw new Error(
        `Unsupported file type: ${fileType}. Only image and PDF files are supported.`,
      );
    }
  }

  // -------------------------------------------------------------
  // 🖼️ IMAGE WATERMARK - FIXED
  // -------------------------------------------------------------
  async applyImageWatermark(
    imageUrl: string,
    type: 'text' | 'image',
    text?: string,
    logoUrl?: string,
    position: string = 'bottom-right',
    opacity: number = 0.7,
    fontSize: number = 24,
  ): Promise<string> {
    const output = `/tmp/${Date.now()}_watermarked.png`;

    try {
      // Fetch input image
      const imageRes: Response = await fetch(imageUrl);
      if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageUrl}`);
      const imageBuffer = Buffer.from(await imageRes.arrayBuffer());

      // Use sharp directly without default
      const image = sharp(imageBuffer);
      const metadata = await image.metadata();
      const height = metadata.height ?? 600;
      const width = metadata.width ?? 800;

      let overlay: sharp.OverlayOptions;

      if (type === 'text') {
        if (!text)
          throw new Error('Text content is required for text watermark');

        const svgText = this.createTextSvg(
          text,
          width,
          height,
          position,
          fontSize,
          opacity,
        );
        overlay = {
          input: svgText,
          gravity: this.getSharpGravity(position),
        };
      } else {
        if (!logoUrl)
          throw new Error('Logo URL is required for image watermark.');

        const logoRes: Response = await fetch(logoUrl);
        if (!logoRes.ok) throw new Error(`Failed to fetch logo: ${logoUrl}`);
        const logoBuffer = Buffer.from(await logoRes.arrayBuffer());

        // Resize logo to be 30% of the original image width
        const resizedLogo = await sharp(logoBuffer) // Use sharp directly
          .resize(Math.round(width * 0.3))
          .png()
          .toBuffer();

        overlay = {
          input: resizedLogo,
          gravity: this.getSharpGravity(position),
        };
      }

      await image.composite([overlay]).toFile(output);
      return output;
    } catch (error) {
      console.error('[ImageWatermark] Error:', error);
      throw error;
    }
  }

  // -------------------------------------------------------------
  // 📄 PDF WATERMARK
  // -------------------------------------------------------------
  async applyPdfWatermark(
    pdfUrl: string,
    type: 'text' | 'image',
    text?: string,
    logoUrl?: string,
    position: string = 'bottom-right',
    opacity: number = 0.7,
    fontSize: number = 24,
  ): Promise<string> {
    const output = `/tmp/${Date.now()}_watermarked.pdf`;

    try {
      const response: Response = await fetch(pdfUrl);
      if (!response.ok) throw new Error(`Failed to fetch PDF: ${pdfUrl}`);
      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const coords = this.getPdfCoordinates(position, width, height);

        if (type === 'text' && text) {
          page.drawText(text, {
            x: coords.x,
            y: coords.y,
            size: fontSize,
            color: rgb(0, 0, 0),
            opacity: opacity,
          });
        } else if (type === 'image' && logoUrl) {
          const logoResponse: Response = await fetch(logoUrl);
          if (!logoResponse.ok)
            throw new Error(`Failed to fetch logo: ${logoUrl}`);
          const logoBytes = await logoResponse.arrayBuffer();
          const logo = await pdfDoc.embedPng(logoBytes);
          const scale = 0.2; // 20% of original size

          page.drawImage(logo, {
            x: coords.x,
            y: coords.y,
            width: logo.width * scale,
            height: logo.height * scale,
            opacity: opacity,
          });
        }
      }

      const watermarkedPdf = await pdfDoc.save();
      await fs.writeFile(output, Buffer.from(watermarkedPdf));
      return output;
    } catch (error) {
      console.error('[PdfWatermark] Error:', error);
      throw error;
    }
  }

  // -------------------------------------------------------------
  // 🎯 POSITION HELPER METHODS
  // -------------------------------------------------------------

  private createTextSvg(
    text: string,
    width: number,
    height: number,
    position: string,
    fontSize: number,
    opacity: number,
  ): Buffer {
    const coords = this.getSvgCoordinates(position, width, height);

    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <text 
          x="${coords.x}" 
          y="${coords.y}" 
          font-size="${fontSize}" 
          fill="white" 
          opacity="${opacity}"
          text-anchor="${coords.anchor}"
          font-family="Arial, sans-serif"
          stroke="black" 
          stroke-width="1"
        >${this.escapeSvgText(text)}</text>
      </svg>`;

    return Buffer.from(svg);
  }

  private escapeSvgText(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private getSharpGravity(position: string): string {
    const gravityMap: { [key: string]: string } = {
      'top-left': 'northwest',
      'top-right': 'northeast',
      center: 'center',
      'bottom-left': 'southwest',
      'bottom-right': 'southeast',
    };
    return gravityMap[position] || 'southeast';
  }

  private getSvgCoordinates(
    position: string,
    width: number,
    height: number,
  ): { x: number; y: number; anchor: string } {
    const padding = 20;
    switch (position) {
      case 'top-left':
        return { x: padding, y: padding + 20, anchor: 'start' };
      case 'top-right':
        return { x: width - padding, y: padding + 20, anchor: 'end' };
      case 'center':
        return { x: width / 2, y: height / 2, anchor: 'middle' };
      case 'bottom-left':
        return { x: padding, y: height - padding, anchor: 'start' };
      case 'bottom-right':
        return { x: width - padding, y: height - padding, anchor: 'end' };
      default:
        return { x: width - padding, y: height - padding, anchor: 'end' };
    }
  }

  private getPdfCoordinates(
    position: string,
    width: number,
    height: number,
  ): { x: number; y: number } {
    const padding = 50;
    switch (position) {
      case 'top-left':
        return { x: padding, y: height - padding };
      case 'top-right':
        return { x: width - padding, y: height - padding };
      case 'center':
        return { x: width / 2, y: height / 2 };
      case 'bottom-left':
        return { x: padding, y: padding };
      case 'bottom-right':
        return { x: width - padding, y: padding };
      default:
        return { x: width - padding, y: padding };
    }
  }
}
