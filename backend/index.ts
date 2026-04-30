import dotenv from 'dotenv';
import express, { Request, Response } from 'express';

dotenv.config();

const app = express();

const PORT: number = Number(process.env.PORT) || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});