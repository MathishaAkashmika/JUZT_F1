import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password;
      return ret;
    },
  },
})
export class User {
  @ApiProperty({
    example: 'auth0|123456789',
    description: 'The Auth0 user ID',
  })
  @Prop({ required: true, unique: true })
  auth0Id: string;

  @ApiProperty({
    example: 'user@example.com',
    description: 'The email of the user',
  })
  @Prop({ required: true })
  email: string;

  @ApiProperty({
    example: 'John',
    description: 'The first name of the user',
  })
  @Prop()
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'The last name of the user',
  })
  @Prop()
  lastName: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'URL to user profile picture',
  })
  @Prop()
  picture: string;

  @ApiProperty({
    example: true,
    description: 'Whether the user is active',
  })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({
    example: ['user'],
    description: 'The roles of the user',
  })
  @Prop({ type: [String], default: ['user'] })
  roles: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
