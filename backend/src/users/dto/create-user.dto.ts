import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsBoolean,
  IsArray,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @ApiPropertyOptional({
    example: 'John',
    description: 'The first name of the user',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Doe',
    description: 'The last name of the user',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Whether the user is active',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: ['user'],
    description: 'The roles of the user',
    default: ['user'],
  })
  @IsArray()
  @IsOptional()
  roles?: string[];

  @ApiPropertyOptional({
    example: 'auth0|123456789',
    description: 'The Auth0 user ID',
  })
  @IsString()
  @IsOptional()
  auth0Id?: string;

  @ApiPropertyOptional({
    example: 'picture.jpg',
    description: 'User Image',
  })
  @IsString()
  @IsOptional()
  picture?: string;
}
