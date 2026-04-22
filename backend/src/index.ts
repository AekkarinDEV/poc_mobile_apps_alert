import express from 'express';
import cors from 'cors';
import authRoutes from './controllers/auth';
import fcmRoutes from './controllers/fcm';
import notifyRoutes from './controllers/notify';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/fcm', fcmRoutes);
app.use('/notify', notifyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
