import { Router, Request, Response } from 'express';
import { Kobble } from '@kobbleio/admin';
import axios from 'axios';

const VAPI_BASE_URL = 'https://api.vapi.com';

export default (kobble: Kobble) => {
  const router = Router();

  // Endpoint to handle GPT requests
  router.post('/gpt-endpoint', async (req: Request, res: Response) => {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        return res.status(400).json({ error: 'Authorization header is missing' });
      }

      const accessToken = authorization.split(' ')[1];
      const user = await kobble.auth.verifyAccessToken(accessToken);
      const userData = await kobble.users.getById(user.userId, { includeMetadata: true });

      if (!userData.metadata || !userData.metadata.apiKey) {
        return res.status(400).json({
          assistant_message: 'The user has no VAPI API Key. Ask the user to provide the API Key and send it to the setup endpoint',
          error: 'No API Key',
        });
      }

      const { data } = await axios.post(`${VAPI_BASE_URL}/endpoint`, req.body, {
        headers: {
          'Authorization': `Bearer ${userData.metadata.apiKey}`,
        },
      });

      res.json(data);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoint to set the VAPI API key
  router.post('/set-vapi-key', async (req: Request, res: Response) => {
    try {
      const authorization = req.headers.authorization;
      if (!authorization) {
        return res.status(400).json({ error: 'Authorization header is missing' });
      }

      const accessToken = authorization.split(' ')[1];
      const user = await kobble.auth.verifyAccessToken(accessToken);
      const { apiKey } = req.body;

      await kobble.users.updateMetadata(user.userId, { apiKey });

      res.status(200).json({ message: 'API key updated successfully' });
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
