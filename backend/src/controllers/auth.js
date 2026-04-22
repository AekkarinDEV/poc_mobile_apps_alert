"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../prisma"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/team', async (req, res) => {
    const { name } = req.body;
    try {
        const team = await prisma_1.default.team.create({ data: { name } });
        res.json(team);
    }
    catch (err) {
        res.status(400).json({ error: 'Error creating team' });
    }
});
router.post('/register', async (req, res) => {
    const { username, password, role, teamId } = req.body;
    try {
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: {
                username,
                password: hashedPassword,
                role: role || 'USER',
                teamId: teamId || null,
            }
        });
        res.json({ id: user.id, username: user.username, role: user.role, teamId: user.teamId });
    }
    catch (err) {
        res.status(400).json({ error: 'Error registering user', details: err.message });
    }
});
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma_1.default.user.findUnique({ where: { username } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const match = await bcrypt_1.default.compare(password, user.password);
        if (!match) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username, role: user.role, teamId: user.teamId }, authMiddleware_1.JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role, teamId: user.teamId } });
    }
    catch (err) {
        res.status(500).json({ error: 'Login error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map