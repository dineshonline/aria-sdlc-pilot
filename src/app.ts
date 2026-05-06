import express from 'express';
import { login } from './auth/loginController';
import { logout } from './auth/logoutController';

const app = express();
app.use(express.json());

app.post('/login', login);
app.post('/logout', logout);

export default app;