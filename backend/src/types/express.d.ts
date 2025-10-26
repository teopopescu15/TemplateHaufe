import { JwtPayload } from '../services/jwtService';

declare global {
  namespace Express {
    interface User extends JwtPayload {}
    interface Request {
      user?: JwtPayload;
    }
  }
}

export {};
