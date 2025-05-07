/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Controller, Get, UseGuards, Req, Res, Query } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UsersService } from 'src/users/users.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) { }

  @Get('login')
  @ApiOperation({ summary: 'Redirect to Auth0 login page' })
  @ApiResponse({ status: 302, description: 'Redirect to Auth0' })
  login(@Res() res: Response) {
    // Construct Auth0 login URL
    const authorizationUrl = `https://${this.configService.get(
      'AUTH0_DOMAIN',
    )}/authorize?`;

    const params = new URLSearchParams();
    params.append('response_type', 'code');
    params.append('client_id', this.configService.get('AUTH0_CLIENT_ID') || '');
    params.append(
      'redirect_uri',
      this.configService.get('AUTH0_CALLBACK_URL') || '',
    );
    params.append('scope', 'openid profile email');
    params.append('audience', this.configService.get('AUTH0_AUDIENCE') || '');

    return res.redirect(authorizationUrl + params.toString());
  }

  @Get('callback')
  @ApiOperation({ summary: 'Auth0 callback endpoint' })
  @ApiResponse({
    status: 302,
    description: 'Redirect with token and user data',
  })
  async callback(@Query('code') code: string, @Res() res: Response) {
    try {
      // Exchange authorization code for tokens
      const tokenResponse = await fetch(
        `https://${this.configService.get('AUTH0_DOMAIN')}/oauth/token`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'authorization_code',
            client_id: this.configService.get('AUTH0_CLIENT_ID'),
            client_secret: this.configService.get('AUTH0_CLIENT_SECRET'),
            code,
            redirect_uri: this.configService.get('AUTH0_CALLBACK_URL'),
          }),
        },
      );

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        console.error('Token error:', tokenData.error);
        return res.redirect('/auth/login-failed');
      }

      // Now fetch user profile using the access token
      const userInfoResponse = await fetch(
        `https://${this.configService.get('AUTH0_DOMAIN')}/userinfo`,
        {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        },
      );

      const userInfo = await userInfoResponse.json();

      const existingUser = await this.userService.findByAuth0Id(userInfo.sub);

      let user;

      if (existingUser) {
        console.info('User already exists:', existingUser);
        user = existingUser;
      } else {
        const createUserDto: CreateUserDto = {
          auth0Id: userInfo.sub,
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          picture: userInfo.picture,
        };
        await this.userService.create(createUserDto);
      }

      console.info('User created:', user);
      if (!userInfo || !userInfo.sub) {
        console.error('Failed to get user info');
        return res.redirect('/auth/login-failed');
      }

      // Redirect to frontend with tokens and encoded user data
      return res.redirect(
        `${this.configService.get('FRONTEND_URL')}/auth/success?access_token=${tokenData.access_token}&id_token=${tokenData.id_token}`,
      );
    } catch (error) {
      console.error('Auth callback error:', error);
      return res.redirect('/auth/login-failed');
    }
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@Req() req) {
    // The access token is available from the request
    const accessToken = req.headers.authorization.split(' ')[1];
    return this.authService.getUserProfile(accessToken);
  }
}
