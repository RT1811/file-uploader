# File Uploader

A full-stack file management application built with Node.js, Express, PostgreSQL, Prisma, and Cloudinary.

The application allows authenticated users to create nested folder structures, upload and manage files, view file metadata, and download files stored in Cloudinary. Folder and file access is scoped to the user who owns them.

This project was built as part of **The Odin Project's Node.js curriculum**.

## Features

### Authentication

* User registration and login
* Passwords hashed with bcrypt
* Local authentication with Passport.js
* Session-based authentication
* Protected folder and file routes

### Folder Management

* Create root folders
* Create folders inside other folders
* Navigate through nested folder structures
* Rename folders
* Delete folders
* Cascade deletion of nested database records
* Folder ownership enforced server-side

Example structure:

```text
Documents
└── University
    └── CPSC
        └── Assignments
```

Each folder stores a reference to its parent folder, allowing arbitrary nesting depth.

### File Management

* Upload files into specific folders
* Store file metadata in PostgreSQL
* Store uploaded files using Cloudinary
* View file details including:

  * Original filename
  * File size
  * Upload date
* Download files from Cloudinary
* Delete files from both Cloudinary and the database
* Temporary local Multer files are removed after successful cloud upload

### File Validation

Uploads are restricted to a maximum size of **5 MB**.

Currently supported MIME types:

```text
text/plain
application/pdf
image/png
image/jpeg
```

Unsupported file types are rejected before being uploaded to Cloudinary.

## Tech Stack

### Backend

* Node.js
* Express 5
* Passport.js
* express-session
* bcryptjs
* Multer

### Database

* PostgreSQL
* Prisma ORM
* `@prisma/adapter-pg`

### File Storage

* Cloudinary

### Views

* EJS

### Validation

* express-validator
* Multer file size and MIME-type validation

## How It Works

### Folder Relationships

Folders use a self-referencing Prisma relationship.

A root folder has:

```text
parentFolderId = null
```

A nested folder stores the ID of its parent:

```text
Documents
id = 1
parentFolderId = null

University
id = 2
parentFolderId = 1

CPSC
id = 3
parentFolderId = 2
```

The same folder route can therefore display a folder regardless of how deeply nested it is.

### File Upload Flow

```text
User selects file
        ↓
Multer receives upload
        ↓
File size/type validated
        ↓
Temporary local file created
        ↓
File uploaded to Cloudinary
        ↓
Cloudinary URL and metadata returned
        ↓
Metadata stored with Prisma
        ↓
Temporary local file deleted
```

Each file is associated with a folder using its `folderId`.

### Authorization

Folder ownership is checked on the server rather than relying on the UI.

For example, folder queries require both:

```text
requested folder ID
+
logged-in user's ID
```

Files inherit ownership through their folder:

```text
User
└── Folder
    └── File
```

A file can only be accessed when the folder containing it belongs to the currently authenticated user.

## Project Structure

```text
file-uploader/
├── config/
│   ├── cloudinary.js
│   ├── multer.js
│   └── passport.js
│
├── lib/
│   └── prisma.js
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── routes/
│   ├── auth.js
│   ├── file.js
│   ├── folder.js
│   └── index.js
│
├── views/
│   ├── files/
│   ├── folders/
│   ├── index.ejs
│   ├── log-in-form.ejs
│   └── sign-up-form.ejs
│
├── app.js
├── package.json
└── prisma7.config.js
```

## Database Models

The application uses three main models:

```text
User
├── owns many Folders

Folder
├── belongs to User
├── optionally belongs to another Folder
├── contains child Folders
└── contains Files

File
└── belongs to Folder
```

Cloudinary-specific metadata is also stored for each uploaded file so that assets can be retrieved and deleted from cloud storage.

## Local Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a PostgreSQL database

For example:

```text
file_uploader
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/file_uploader?schema=public"

SESSION_SECRET="your-session-secret"

CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"
```

Do not commit `.env` or expose the Cloudinary API secret.

### 4. Apply Prisma migrations

```bash
npx prisma migrate dev
```

### 5. Generate the Prisma client

```bash
npx prisma generate
```

### 6. Start the application

```bash
node app.js
```

The application runs on:

```text
http://localhost:3000
```

unless a different `PORT` environment variable is supplied.

## Main Routes

```text
GET  /
     View the authenticated user's root folders

GET  /sign-up
POST /sign-up

GET  /log-in
POST /log-in
POST /log-out

GET  /folders/new
POST /folders/new

GET  /folders/:id
     View a folder and its contents

GET  /folders/:id/new
POST /folders/:id/new
     Create a nested folder

GET  /folders/:id/rename
POST /folders/:id/rename

POST /folders/:id/delete

POST /folders/:id/files
     Upload a file into a folder

GET  /files/:id
     View file metadata

GET  /files/:id/download
     Download the Cloudinary-hosted file

POST /files/:id/delete
     Delete the Cloudinary asset and database record
```

## What I Learned

This project focused heavily on connecting multiple backend concepts into one application:

* Designing relational data with Prisma
* Modeling recursive/self-referencing database relationships
* PostgreSQL foreign keys and cascading deletes
* Authentication with Passport
* Session-based authentication
* Resource ownership and authorization
* Handling multipart form data with Multer
* File metadata management
* Cloud storage integration with Cloudinary
* Cleaning up temporary filesystem resources
* Separating user-facing filenames from cloud asset identifiers
* File size and MIME-type validation
* Designing nested REST-style routes

One of the main takeaways from the project was understanding the complete request lifecycle:

```text
Browser
→ Express route
→ authentication/authorization
→ Prisma
→ PostgreSQL
→ Cloudinary
→ EJS
→ Browser
```

## Acknowledgements

Built as part of [The Odin Project](https://www.theodinproject.com/) Node.js curriculum.
