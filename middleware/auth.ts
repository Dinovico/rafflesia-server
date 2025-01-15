import type { Request, Response, NextFunction } from 'express';
import { getAuth } from 'firebase-admin/auth';


export default async function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    console.log("Token not found in Authorization header");
    return res
      .status(401)
      .json({ status: 401, message: 'Token not found in Authorization header' });
  }

  
  try {
    await getAuth()
      .verifyIdToken(token)
      .then((decodedToken) => {
        req.params.auth_id = decodedToken.uid;
        next(); // Call next() inside the then block to continue execution
      })
      .catch((error) => {
        if (error.code === 'auth/id-token-expired') {
          console.log('Expired token');
          // Handle the expired token error here
          // For example, you can send a new token to the client or redirect to a login page
          return res.status(498).json({ status: 498, message: 'Expired token' });
        } else {
          console.log(error);
          return res.status(401).json({ error });
        }
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
}
