# 📄 Pixel Hive

**Asynchronous Media Processing API for PDFs, Images, Videos & QR Codes**

Effortless, scalable media processing using **NestJS, BullMQ, Redis, Cloudinary, and Swagger**. Pixel Hive provides a developer-first backend for handling CPU-intensive media tasks asynchronously with job tracking, retries, and notifications.

🚀 **Ideal for** SaaS platforms, content systems, automation pipelines, and backend services that need reliable PDF generation, watermarking, video thumbnail extraction, and QR code operations.

---

## 🚀 Introduction

**Pixel Hive** is a cloud-based media-processing backend designed to eliminate the complexity of handling heavy file operations synchronously.

Instead of blocking API requests, Pixel Hive:

- Pushes tasks to background queues
- Processes them using dedicated workers
- Uploads results to Cloudinary
- Tracks job status in PostgreSQL
- Notifies users via email

The platform exposes a **fully authenticated Swagger API** and is built for horizontal scalability.
No frontend UI is included — Pixel Hive is **API-only by design**.

---

## 📊 Architecture Overview

```
Client (Authenticated Request)
        |
        v
NestJS Controllers
        |
        v
Service Layer
(Create DB Job + Push Queue)
        |
        v
BullMQ Queue (Redis)
        |
        v
Worker Processors
(PDF / Image / Video / QR)
        |
        v
Cloudinary Upload
        |
        v
PostgreSQL (Job Status Update)
        |
        v
Email Notification (Success / Failure)
```

**Key design principles**

- Fully asynchronous processing
- Retry with exponential backoff
- Stateless API
- Horizontally scalable workers

---

## 🧠 Key Features Recap

✅ **PDF Generation**
Generate PDFs from text or HTML using PDFKit and Puppeteer.

✅ **PDF Merge (Images → PDF)**
Combine multiple images into a single downloadable PDF.

✅ **Image & PDF Watermarking**
Apply text or image watermarks with custom opacity, position, and size.

✅ **Video Upload & Thumbnail Generation**
Upload videos and automatically generate preview thumbnails.

✅ **QR Code Generation & Decoding**
Generate QR codes or decode QR data from uploaded images.

✅ **JWT Authentication**
Secure all endpoints with token-based access control.

✅ **BullMQ Worker Queues**
Heavy jobs run in background workers with retries.

✅ **Email Notifications**
Users are notified when jobs complete or fail.

✅ **Swagger API Docs**
Auto-generated documentation for testing and integration.

---

## ⚙️ Installation (For End Users / API Consumers)

```bash
# Clone repository
git clone https://github.com/your-username/pixel-hive.git
cd pixel-hive

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Add your values to the .env file

# Start API
npm run start:dev

# Start worker (required for processing)
npm run start:worker
```

Swagger UI will be available at:

```
http://localhost:3000/api
```

---

## 🛠️ Installation (For Contributors / Developers)

```bash
# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev
npx prisma generate

# Run linting
npm run lint

# Run tests
npm run test

# Build project
npm run build
```

---

## 📚 Using the Swagger API

### 1️⃣ Authentication

- `POST /auth/signup`
- `POST /auth/login`

Copy the returned JWT token and authorize Swagger using:

```
Bearer <your_token>
```

---

### 2️⃣ Submitting Jobs

Each media endpoint creates a **job**, not an instant result.

Example:

- `POST /pdf/generate`
- `POST /watermark/upload`
- `POST /video/upload`

Response includes a `jobId`.

---

### 3️⃣ Checking Job Status

Poll the relevant status endpoint:

```
GET /<service>/:id/status
```

Once completed:

- Cloudinary URL is returned
- Email notification is sent

---

## 🤝 Contributing

Contributions are welcome. Please follow these guidelines:

- 🔧 Follow NestJS architectural patterns
- 🧪 Add unit tests for new features
- 📝 Document endpoints using Swagger decorators
- 🚀 Use async/await (no callbacks)
- ✅ Validate inputs with DTOs and pipes

**Getting started**

1. Fork the repo
2. Create a feature branch
3. Submit a PR with clear description

---

## ⚠️ Known Limitations

❗ No real-time job streaming (polling only)
❗ No frontend UI (API-only by design)
❗ No batch job submission yet

---

## 🔮 Future Enhancements

- Web dashboard for job tracking
- Video transcoding support
- Batch processing endpoints
- Subscription & billing model

---

## 👩‍💻 Author

**Tiffany Ugwunebo**
Backend Engineer & System Architect
