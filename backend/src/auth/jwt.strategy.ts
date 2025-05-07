import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as jwksRsa from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${configService.get<string>('AUTH0_DOMAIN')}/.well-known/jwks.json`,
      }),
      audience: configService.get<string>('AUTH0_AUDIENCE'),
      issuer: `https://${configService.get<string>('AUTH0_DOMAIN')}/`,
      algorithms: ['RS256'],
    });
  }

  async validate(payload: any) {
    // The sub claim in the JWT token contains the Auth0 user ID
    try {
      // Check if user exists in our database, if not create them
      const user = await this.usersService.findOrCreateByAuth0Id(
        payload.sub,
        payload.email || '',
      );

      return {
        userId: user._id,
        auth0Id: payload.sub,
        email: payload.email,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
