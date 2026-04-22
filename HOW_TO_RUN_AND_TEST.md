# How to Run and Test FCM Without Firebase Auth

This guide will walk you through setting up your Firebase credentials, booting both the `backend` and `mobile` projects, and verifying that Firebase Cloud Messaging (FCM) push notifications successfully reach your device based on custom backend authentication.

---

## 1. Firebase Project Setup
Because we need access to Google's Push Notification services, a Firebase project is required strictly for token management.

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Under **Project Settings > Service Accounts**, click **Generate new private key**. This will download a `.json` file containing your server credentials.
3. Under **Project Settings > General**, add an **Android Application** and/or an **iOS Application**. This will allow you to download `google-services.json` (for Android) and `GoogleService-Info.plist` (for iOS).

---

## 2. Backend Setup & Run

The backend is built with Express + TypeScript + Prisma + SQLite.

### Configure Credentials
1. Open up `/backend/.env`.
2. Convert the content of the downloaded `Service Account` JSON file from Firebase into a single-line string.
3. Add it to the `.env` file under `FIREBASE_SERVICE_ACCOUNT`:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your_secret_key"
   FIREBASE_SERVICE_ACCOUNT='{"type": "service_account", "project_id": "...", ...}'
   ```

### Start the Server
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Build and start the development server using `tsx`:
   ```bash
   npm run dev
   # Or you can do: npx tsx src/index.ts
   ```
3. The server will start on `http://localhost:3000`. Keep this running.

---

## 3. Mobile App Setup & Run

The mobile application relies on React Native Firebase, which **must be compiled natively**. It will not work out-of-the-box inside the standard Expo Go app.

### Configure Credentials
1. Place the `google-services.json` and/or `GoogleService-Info.plist` files you downloaded from Firebase into the root of the `/mobile` folder.
2. In `mobile/app.json`, map the files natively:
   ```json
   "ios": {
     "supportsTablet": true,
     "googleServicesFile": "./GoogleService-Info.plist"
   },
   "android": {
     "adaptiveIcon": {
       "foregroundImage": "./assets/images/adaptive-icon.png",
       "backgroundColor": "#ffffff"
     },
     "googleServicesFile": "./google-services.json"
   }
   ```
3. Depending on whether you are using physical devices or an emulator, you may need to update the `API_URL` variable in `mobile/src/services/api.ts` from `http://localhost:3000` to your computer's local IP address (e.g., `http://192.168.1.50:3000`).

### Build & Start
1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Build the custom development client natively onto your emulator or plugged-in device:
   ```bash
   npx expo run:android
   # Or for iOS (Requires a Mac + Xcode):
   # npx expo run:ios
   ```

---

## 4. End-to-End Testing Procedure

Once both servers are actively running and your mobile app is installed natively:

### Step A: Register Your Team and User (Backend)
Open a new terminal or utilize Postman. Use this `curl` command to create a team and register a new custom user named `testuser`.

Create a Team:
```bash
curl -X POST http://localhost:3000/auth/team \
  -H 'Content-Type: application/json' \
  -d '{"name": "Engineering"}'
```
*(Copy the generated `teamId` from the response)*

Register User:
```bash
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "testuser",
    "password": "password123",
    "role": "USER",
    "teamId": "INSERT_TEAM_ID_HERE"
  }'
```
*(Copy the generated `id` representing the user)*

### Step B: Log into the Mobile App
1. Open the Mobile App on your emulator/device.
2. Use the credentials you just made (`testuser` / `password123`).
3. Press **Login**. Upon success, it will redirect you to the Dashboard.
4. Native Firebase Messaging will prompt the device for Notification UI capability. Once you press **Allow**, it silently pulls the device token and executes a `POST /fcm/register-token` binding the token to `testuser` inside the backend securely natively!
5. *Check your Node backend logs to ensure token registration succeeded.*

### Step C: Trigger Notifications
Use `curl` or Postman to trigger notifications explicitly to that internal user using their User ID:

Send Notification to User:
```bash
curl -X POST http://localhost:3000/notify/user \
  -H 'Authorization: Bearer INSERT_YOUR_JWT_HERE_IF_WANTED_OR_TEST_AS_REGISTERED' \
  -H 'Content-Type: application/json' \
  -d '{
    "targetUserId": "PASTE_THE_USER_ID_HERE",
    "title": "Alert Triggered!",
    "body": "Pinging standard testing FCM without Firebase Auth!"
  }'
```
*(Note: Because `/notify/user` is wrapped in `requireAuth` by default, ensure you capture the generated Token string when you execute a `/auth/login` request manually, or temporarily strip `requireAuth` from the route inside `/backend/src/controllers/notify.ts` to test freely without Bearer tokens!)*

**Congratulations!** You should immediately see the alert display on the device both in the foreground (via JS Alert interception) or Native System Headers if running in the background.
