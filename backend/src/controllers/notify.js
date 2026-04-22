"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const firebase_1 = __importDefault(require("../firebase"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/user', authMiddleware_1.requireAuth, async (req, res) => {
    const { targetUserId, title, body } = req.body;
    try {
        const tokens = await prisma_1.default.fcmToken.findMany({ where: { userId: targetUserId } });
        if (tokens.length === 0) {
            res.status(404).json({ error: 'No FCM tokens found for user' });
            return;
        }
        const fcmTokens = tokens.map(t => t.token);
        if (firebase_1.default.apps.length === 0) {
            res.status(500).json({ error: 'Firebase Admin not initialized properly' });
            return;
        }
        const result = await firebase_1.default.messaging().sendEachForMulticast({
            tokens: fcmTokens,
            notification: { title, body }
        });
        res.json({ success: true, result });
    }
    catch (err) {
        res.status(500).json({ error: 'Error sending notification', details: err.message });
    }
});
router.post('/team', authMiddleware_1.requireAuth, async (req, res) => {
    const { teamId, title, body } = req.body;
    try {
        const users = await prisma_1.default.user.findMany({ where: { teamId }, select: { id: true } });
        if (users.length === 0) {
            res.status(404).json({ error: 'No users found in team' });
            return;
        }
        const userIds = users.map(u => u.id);
        const tokens = await prisma_1.default.fcmToken.findMany({ where: { userId: { in: userIds } } });
        if (tokens.length === 0) {
            res.status(404).json({ error: 'No FCM tokens found for team users' });
            return;
        }
        const fcmTokens = tokens.map(t => t.token);
        if (firebase_1.default.apps.length === 0) {
            res.status(500).json({ error: 'Firebase Admin not initialized properly' });
            return;
        }
        const result = await firebase_1.default.messaging().sendEachForMulticast({
            tokens: fcmTokens,
            notification: { title, body }
        });
        res.json({ success: true, result });
    }
    catch (err) {
        res.status(500).json({ error: 'Error sending notification', details: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=notify.js.map