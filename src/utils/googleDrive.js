import { google } from 'googleapis';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

const drive = google.drive({ version: 'v3', auth: oAuth2Client });

export const uploadFile = async (fileName, filePath, mimeType) => {
  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: mimeType,
    },
    media: {
      mimeType: mimeType,
      body: fs.createReadStream(filePath),
    },
  });
  return response.data;
};

export const listFiles = async () => {
  const response = await drive.files.list();
  return response.data.files;
};

export const downloadFile = async (fileId, destPath) => {
  const response = await drive.files.get(
    { fileId, alt: 'media' },
    { responseType: 'stream' }
  );
  const dest = fs.createWriteStream(destPath);
  response.data.pipe(dest);
};
