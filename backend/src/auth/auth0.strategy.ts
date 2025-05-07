import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-auth0';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      domain: configService.get<string>('AUTH0_DOMAIN'),
      clientID: configService.get<string>('AUTH0_CLIENT_ID'),
      clientSecret: configService.get<string>('AUTH0_CLIENT_SECRET'),
      callbackURL: configService.get<string>('AUTH0_CALLBACK_URL'),
      scope: 'openid email profile',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    extraParams: any,
    profile: any,
    done: any,
  ) {
    try {
      // Get user data from profile
      const auth0Id = profile.id;
      const email = profile.emails[0]?.value;

      // Find or create user in our database
      const user = await this.usersService.findOrCreateByAuth0Id(
        auth0Id,
        email,
      );

      const userData = {
        auth0Id,
        email,
        firstName: profile.name?.givenName || '',
        lastName: profile.name?.familyName || '',
        userId: user._id,
        accessToken,
      };

      return done(null, userData);
    } catch (error) {
      return done(error);
    }
  }
}
