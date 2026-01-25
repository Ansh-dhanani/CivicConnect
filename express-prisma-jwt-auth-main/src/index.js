import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import env from 'dotenv';
import isAuthenticated from './middleware/isAuthenticated.js';
import SessionController from './controllers/SessionController.js';
import UserController from './controllers/UserController.js';
import ComplaintController from './controllers/ComplaintController.js';

env.config({
  path: './.env',
});

const app = express();
const router = express.Router();

const port = process.env.API_PORT || 4000;

const main = async () => {
  app.use(bodyParser.json());
  app.use(
    cors({
      origin: process.env.FRONTEND_SERVER,
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  router.get('/', (req, res) => {
    res.send('CivicConnect API v1');
  });

  // Auth & User
  router.post('/auth/login', SessionController.loginWithEmailAndPassword);
  router.post('/auth/register', UserController.create);
  router.get('/users/profile', isAuthenticated, UserController.getProfile);
  router.put('/users/profile', isAuthenticated, UserController.updateProfile);

  // Complaints
  router.post('/complaints', isAuthenticated, ComplaintController.create);
  router.get('/complaints/my-complaints', isAuthenticated, ComplaintController.getMyComplaints);
  router.get('/complaints/nearby', ComplaintController.getNearby); // Public? Or auth? Doc says nothing, usually public or auth. Let's make public for map view.
  router.post('/complaints/:complaintId/upvote', isAuthenticated, ComplaintController.toggleUpvote);
  router.delete('/complaints/:complaintId/upvote', isAuthenticated, ComplaintController.toggleUpvote); // Reuse toggle for simplicity or separate if strict

  app.use('/api', router);

  app.listen(port, () =>
    // eslint-disable-next-line no-console
    console.log(`App listening on port ${port}`)
  );
};

main();
