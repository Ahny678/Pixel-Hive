# 📦 PIXEL HIVE

This project is a **NestJS backend** that provides asynchronous media processing services.
All jobs run in **queues** (via [BullMQ](https://docs.bullmq.io/)), so users can submit tasks and receive an **email notification** when processing is complete.

---

## 🚀 Features

### 📝 PDF Service

* Generate PDFs from text, form data, or HTML input
* Combine multiple images into a single PDF
* Lightweight PDF manipulation (merging, metadata, etc.)

### 🎞️ Video Service

* Extract thumbnails from uploaded video files
* Generate multiple preview images at different timestamps
* Powered by [FFmpeg](https://ffmpeg.org/)

### 🖼️ Image Service

* Compress and optimize images for web use
* Resize images into multiple resolutions (thumbnails, mobile, desktop)
* Supported formats: PNG, JPG, WebP, etc.

### 🔄 Conversion Service

* Convert between file formats:

  * Image → PDF
  * PDF → Images (per page)
* (Optional) DOCX → PDF support with LibreOffice CLI (heavier dependency)

### 📷 QR / Barcode Service

* Generate QR codes and barcodes (URLs, text, contact info, etc.)
* Decode and read QR codes from uploaded images

---

## 🛠️ Tech Stack

* [NestJS](https://nestjs.com/) — Backend framework
* [BullMQ](https://docs.bullmq.io/) — Queue management
* [Redis](https://redis.io/) — Queue storage
* [Sharp](https://sharp.pixelplumbing.com/) — Image processing
* [FFmpeg](https://ffmpeg.org/) — Video processing
* [pdf-lib / pdfmake](https://github.com/Hopding/pdf-lib) — PDF generation
* [qrcode / zxing](https://github.com/zxing-js/library) — QR & barcode tools

---

## 📩 Workflow Example

1. User uploads a file or submits a request (e.g., “Generate PDF from text”).
2. Task is added to the queue.
3. Worker processes the task in the background.
4. When complete, the user receives an **email notification** with a download link.

 
