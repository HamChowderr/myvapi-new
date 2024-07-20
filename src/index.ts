import express from 'express';
import { Kobble } from '@kobbleio/admin';
import apiRouter from './routes/api';

const app = express();
app.use(express.json());

const kobble = new Kobble(process.env.KOBBLE_CLIENT_SECRET as string);

app.use('/api', apiRouter(kobble));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
