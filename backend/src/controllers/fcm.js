"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/register-token', authMiddleware_1.requireAuth, async (req, res) => {
    const { token } = req.body;
    if (!token) {
        res.status(400).json({ error: 'FCM token required' });
        return;
    }
    try {
        const userId = req.user.id;
        const existing = await prisma_1.default.fcmToken.findUnique({ where: { token } });
        if (!existing) {
            await prisma_1.default.fcmToken.create({
                data: { token, userId }
            });
        }
        else if (existing.userId !== userId) {
            await prisma_1.default.fcmToken.update({
                where: { token },
                data: { userId }
            });
        }
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Error saving FCM token' });
    }
});
exports.default = router;
//# sourceMappingURL=fcm.js.map