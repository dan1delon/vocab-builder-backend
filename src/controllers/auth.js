import createHttpError from 'http-errors';
import { ONE_DAY } from '../constants/constants.js';
import {
  loginOrSignupWithGoogle,
  loginUser,
  logoutUser,
  refreshUsersSession,
  registerUser,
  requestResetToken,
  resetPassword,
} from '../services/auth.js';
import { generateAuthUrl } from '../utils/googleOAuth2.js';
import { getUserInfo } from '../services/auth.js';

export const registerUserController = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      email: user.user.email,
      name: user.user.name,
      token: user.accessToken,
    });
  } catch (error) {
    if (error.status === 409) {
      res.status(409).json({ message: 'Such email already exists' });
    } else {
      next(error);
    }
  }
};

export const loginUserController = async (req, res, next) => {
  try {
    const session = await loginUser(req.body);
    setupSession(res, session);

    res.status(200).json({
      email: session.user.email,
      name: session.user.name,
      token: session.accessToken,
    });
  } catch (error) {
    if (error.status === 401) {
      res.status(401).json({ message: 'Email or password invalid' });
    } else if (error.status === 404) {
      res.status(404).json({ message: 'User not found' });
    } else {
      console.error(error);
      next(error);
    }
  }
};

export const logoutUserController = async (req, res, next) => {
  try {
    if (req.cookies.sessionId) {
      await logoutUser(req.cookies.sessionId);
    }

    res.clearCookie('sessionId', {
      sameSite: 'None',
      secure: true,
    });

    res.clearCookie('refreshToken', {
      sameSite: 'None',
      secure: true,
    });

    res.status(200).json({ message: 'Sign out success' });
  } catch (error) {
    next(error);
  }
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
    sameSite: 'None',
    secure: true,
  });

  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
    sameSite: 'None',
    secure: true,
  });
};

export const refreshUserSessionController = async (req, res) => {
  const { sessionId, refreshToken: cookieRefreshToken } = req.cookies;
  const { refreshToken: bodyRefreshToken } = req.body;
  const authHeader = req.headers.authorization;

  let session;
  try {
    if (sessionId && cookieRefreshToken) {
      session = await refreshUsersSession({
        sessionId,
        refreshToken: cookieRefreshToken,
      });
    } else if (authHeader) {
      const token = authHeader.split(' ')[1];
      if (!token) {
        throw createHttpError(400, 'Authorization header is invalid');
      }
      session = await refreshUsersSession({
        sessionId,
        refreshToken: token,
      });
    } else if (bodyRefreshToken) {
      session = await refreshUsersSession({
        sessionId,
        refreshToken: bodyRefreshToken,
      });
    } else {
      throw createHttpError(400, 'Required data not provided');
    }

    setupSession(res, session);

    res.json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    res.status(error.status || 500).json({
      status: error.status || 500,
      message: error.message,
    });
  }
};

export const requestResetEmailController = async (req, res) => {
  await requestResetToken(req.body.email);
  res.json({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password was successfully reset!',
    status: 200,
    data: {},
  });
};

export const getGoogleOAuthUrlController = async (req, res) => {
  const url = generateAuthUrl();
  res.json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: {
      url,
    },
  });
};

export const loginWithGoogleController = async (req, res) => {
  const { session, user } = await loginOrSignupWithGoogle(req.body.code);
  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in via Google OAuth!',
    data: {
      accessToken: session.accessToken,
      email: user.email,
      name: user.name,
    },
  });
};

export const getUserInfoController = async (req, res, next) => {
  try {
    const user = await getUserInfo(req.user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};
