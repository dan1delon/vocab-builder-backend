import createHttpError from 'http-errors';

import { SessionsCollection } from '../db/models/session.js';
import { UsersCollection } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  console.log('Authorization Header:', authHeader);

  if (!authHeader) {
    next(createHttpError(401, 'Authorization header is required'));
    return;
  }

  const [bearer, token] = authHeader.split(' ');
  console.log('Bearer:', bearer, 'Token:', token);

  if (bearer !== 'Bearer' || !token) {
    next(
      createHttpError(401, 'Auth header should be in "Bearer <token>" format'),
    );
    return;
  }

  const session = await SessionsCollection.findOne({ accessToken: token });
  console.log('Session Found:', session);

  if (!session) {
    next(createHttpError(401, 'Session not found'));
    return;
  }

  const isAccessTokenExpired =
    new Date() > new Date(session.accessTokenValidUntil);
  console.log('Is Access Token Expired:', isAccessTokenExpired);

  if (isAccessTokenExpired) {
    next(createHttpError(401, 'Access token expired'));
    return;
  }

  const user = await UsersCollection.findById(session.userId);
  console.log('User Found:', user);

  if (!user) {
    next(createHttpError(401, 'User not found'));
    return;
  }

  req.user = user;
  next();
};
