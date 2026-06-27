# Cloud

[<img alt="GitHub Workflow Status" src="https://img.shields.io/github/actions/workflow/status/Manish-Dark/cloud/docker-image.yml?style=plastic&logo=github">](https://github.com/Manish-Dark/cloud/actions)
[<img alt="Dockerhub latest" src="https://img.shields.io/badge/dockerhub-latest-blue?logo=docker&style=plastic">](https://hub.docker.com/r/manishvashishtha/cloud)
[<img alt="Docker Image Size (tag)" src="https://img.shields.io/docker/image-size/manishvashishtha/cloud/latest?style=plastic&logo=docker&color=gold">](https://hub.docker.com/r/manishvashishtha/cloud/tags?page=1&name=latest)
[<img alt="Any platform" src="https://img.shields.io/badge/platform-any-green?style=plastic&logo=linux&logoColor=white">](https://github.com/Manish-Dark/cloud)

**Cloud** is a personal cloud storage system that uses **Telegram** as its underlying storage backend. It does not occupy space on your server's filesystem or require paid object storage (like AWS S3 or Google Drive) underneath. Instead, all uploaded files are stored securely as documents in a dedicated Telegram channel via a Telegram Bot.

To bypass Telegram's API file size limits, **Cloud** dynamically splits large files into chunks during upload:
- **15 MB chunks** for files larger than or equal to 1 GB (to ensure upload stability and prevent timeouts).
- **25 MB chunks** for files smaller than 1 GB (to reduce network round-trips for standard files).

When a user requests a file download, the application automatically fetches all associated chunks from the Telegram API, streams them, and reconstructs the original file on-the-fly.

---

## Features

- **Chunked File Transfer:** Seamlessly upload and download files of almost any size.
- **Telegram Backend:** Utilize Telegram's free, unlimited storage via standard Bot API calls.
- **Storage & Access Management:** Create individual virtual storages, organize files into folders, and manage multi-user access control.
- **MongoDB Integration:** All file metadata, storage info, chunk details, and user profiles are stored in MongoDB.
- **Modern Full-Stack Architecture:**
  - **Backend:** Node.js, Express, TypeScript, and Mongoose.
  - **Frontend:** React, Vite, TypeScript, and TailwindCSS (or custom styling).

---

## Prerequisites

Before running the application, make sure you have:
1. A **Telegram Bot Token** (created via [@BotFather](https://t.me/BotFather)).
2. A **Telegram Channel** where the bot is added as an administrator with posting rights.
3. A **Telegram Channel ID** (e.g. `-100xxxxxxxxx`).
4. A **MongoDB connection URI** (either local MongoDB instance or MongoDB Atlas).

---

## Configuration

Create a `.env` file in the root directory (or in the `backend/` directory) and populate it with your configuration:

```env
PORT=8000
SECRET_KEY=your_super_secret_jwt_key
SUPERUSER_EMAIL=admin@example.com
SUPERUSER_PASS=your_admin_password
ACCESS_TOKEN_EXPIRE_IN_SECS=1800
REFRESH_TOKEN_EXPIRE_IN_DAYS=14

# Telegram Settings
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHANNEL_ID=your_channel_id_here
TELEGRAM_API_BASE_URL=https://api.telegram.org

# MongoDB Settings
MONGO_URI=mongodb://your_mongo_user:your_mongo_pass@your_mongo_host:27017/cloud
```

---

## Installation & Deployment

### 1. Running with Docker Compose (Recommended)

You can run the pre-built Docker image using Docker Compose. Create a `docker-compose.yml` file:

```yaml
version: "3.9"

services:
  cloud:
    container_name: cloud
    image: manishvashishtha/cloud:latest
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: unless-stopped
```

Create your `.env` file in the same directory and run:

```sh
docker compose up -d
```

Access the web interface at `http://localhost:8000`.

---

### 2. Building from Source (Local Development)

To run the frontend and backend services locally for development:

#### Clone the Repository
```sh
git clone https://github.com/Manish-Dark/cloud.git
cd cloud
```

#### Set Up the Backend
1. Go to the backend folder:
   ```sh
   cd backend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Copy your `.env` configuration file to the root or load it in your environment.
4. Run the backend in development mode:
   ```sh
   npm run dev
   ```
   The backend server runs on `http://localhost:8000`.

#### Set Up the Frontend
1. In a new terminal window, go to the frontend folder:
   ```sh
   cd frontend
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the Vite development server:
   ```sh
   npm run dev
   ```
   The frontend UI will be available at `http://localhost:5173`.

---

### 3. Production Build from Source

To build a standalone production release where the Node backend hosts and serves the compiled React app static assets:

1. Build the frontend:
   ```sh
   cd frontend
   ```
   ```sh
   npm run build
   ```
   This will generate a production build in the `frontend/dist` directory.
2. Build the backend:
   ```sh
   cd ../backend
   ```
   ```sh
   npm run build
   ```
   This compiles the TypeScript files into Javascript under the `backend/dist` directory.
3. Serve the application:
   - Ensure the compiled frontend files are placed or served under `backend/public` (or copied as defined in your build pipeline).
   - Start the backend:
     ```sh
     npm start
     ```

---

## API Endpoints

The backend exposes the following REST APIs:

- **Authentication (`/api/auth`)**:
  - `POST /api/auth/register` - Create a new user.
  - `POST /api/auth/login` - Authenticate a user and receive a JWT.
- **Users (`/api/users`)**: User profile and configuration.
- **Files (`/api/files`)**:
  - `GET /api/files?storage_id=xxx` - List files inside a virtual storage.
  - `POST /api/files/init` - Initialize chunked file upload.
  - `POST /api/files/:id/chunks` - Upload a specific chunk.
  - `GET /api/files/:id/download` - Stream and download a reconstructed file.
- **Folders (`/api/folders`)**: Create, list, rename, and delete folder structures.
- **Storages (`/api/storages`)**: Manage multiple isolated storage volumes.
- **Access Control (`/api/access`)**: Share storage accesses with other users (Viewer, Editor, Admin).
- **Workers (`/api/workers`)**: Manage worker configurations to optimize and scale upload speeds.

---

## Contributing

Contributions are welcome! Please feel free to open issues or submit pull requests to improve functionality, add features, or update documentation.

1. Fork the Repository.
2. Create your Feature Branch (`git checkout -b feature/amazing-feature`).
3. Commit your Changes (`git commit -m 'Add some amazing-feature'`).
4. Push to the Branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## License

Distributed under the ISC License. See `LICENSE` for more information.
