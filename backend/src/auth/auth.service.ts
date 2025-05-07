import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) { }

  async getUserProfile(accessToken: string) {
    try {
      // Call Auth0's userinfo endpoint to get user profile
      const userInfo = await axios.get(
        `https://${this.configService.get('AUTH0_DOMAIN')}/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      // Find or create user in our database
      const user = await this.usersService.findOrCreateByAuth0Id(
        userInfo.data.sub,
        userInfo.data.email,
      );

      return {
        auth0Profile: userInfo.data,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName || userInfo.data.given_name,
          lastName: user.lastName || userInfo.data.family_name,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to get user profile from Auth0');
    }
  }
}
