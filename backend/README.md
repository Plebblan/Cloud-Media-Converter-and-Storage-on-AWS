# Cloud Media Converter - Backend API

Modular Express.js backend for managing file storage and driving media conversion jobs with `fluent-ffmpeg`.

## Features
- **File Ingestion**: Scalable upload handler using Multer.
- **Conversion Engine**: Abstracted FFmpeg service support for Video, Audio, and Image conversions.
- **File System Storage**: Organizes uploaded raw files and converted output files.
- **RESTful Endpoints**:
  - `GET /api/files` - List storage contents & stats.
  - `POST /api/files/upload` - Upload new files.
  - `DELETE /api/files/:id` - Delete files.
  - `POST /api/convert` - Trigger background conversion job.
  - `GET /api/convert/status/:jobId` - Check conversion status.

## Setup Instructions

1. Ensure **FFmpeg** is installed on your system and added to your PATH environment variable.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
4. Start development server:
   ```bash
   npm run dev
   ```
