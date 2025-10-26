import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import * as UserRepository from '../repositories/UserRepository';

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    scope: ['profile', 'email']
  },
  async (
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) {
        return done(new Error('No email found in Google profile'));
      }

      // Check if user exists by Google ID
      let user = await UserRepository.findByGoogleId(profile.id);

      if (user) {
        return done(null, { id: user.id, email: user.email });
      }

      // Check if user exists by email
      user = await UserRepository.findByEmail(email);

      if (user) {
        // User exists - link Google account to existing user
        user = await UserRepository.linkGoogleAccount(
          user.id,
          profile.id,
          profile.photos?.[0]?.value
        );
        return done(null, { id: user.id, email: user.email });
      }

      // Create new user with Google OAuth
      user = await UserRepository.createUser({
        google_id: profile.id,
        email: email,
        display_name: profile.displayName || email.split('@')[0],
        profile_picture: profile.photos?.[0]?.value,
        email_verified: true
      });

      return done(null, { id: user.id, email: user.email });
    } catch (err) {
      return done(err as Error);
    }
  }
));

export default passport;
