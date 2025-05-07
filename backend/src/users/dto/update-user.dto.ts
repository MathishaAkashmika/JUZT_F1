import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class UpdateUserDto {
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
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({
    example: ['user', 'admin'],
    description: 'The roles of the user',
  })
  @IsArray()
  @IsOptional()
  roles?: string[];
}
