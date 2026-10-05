import { google } from "googleapis";
import { getEnv } from "@/lib/validation/env";

const DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";

export function createGoogleOAuthClient() {
  const env = getEnv();
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET,
    env.GOOGLE_REDIRECT_URI,
  );
}

export function getGoogleAuthUrl(state: string) {
  const client = createGoogleOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [DRIVE_FILE_SCOPE],
    state,
  });
}

export { DRIVE_FILE_SCOPE };
