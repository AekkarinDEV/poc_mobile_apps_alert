"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccount)
        });
        console.log("Firebase Admin initialized");
    }
    catch (error) {
        console.error("Firebase Admin initialization failed", error);
    }
}
else {
    console.log("FIREBASE_SERVICE_ACCOUNT env var missing. FCM will not work until configured.");
}
exports.default = firebase_admin_1.default;
//# sourceMappingURL=firebase.js.map