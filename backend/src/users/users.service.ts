'use client';

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './entities/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async create(createUserDto: CreateUserDto): Promise<UserDocument> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByAuth0Id(auth0Id: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ auth0Id }).exec();
    if (!user) {
      throw new NotFoundException(`User with Auth0 ID ${auth0Id} not found`);
    }
    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserDocument> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, { $set: updateUserDto }, { new: true })
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return updatedUser;
  }

  async remove(id: string): Promise<UserDocument> {
    const deletedUser = await this.userModel.findByIdAndDelete(id).exec();

    if (!deletedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return deletedUser;
  }

  async findOrCreateByAuth0Id(
    auth0Id: string,
    email: string,
    userData?: any,
  ): Promise<UserDocument> {
    console.log('findOrCreateByAuth0Id called with:', {
      auth0Id,
      email,
      userData
    });
    
    // Try to find existing user
    let user = await this.userModel.findOne({ auth0Id }).exec();
    console.log('Existing user found?', !!user);
    
    // If user doesn't exist, create a new one
    if (!user) {
      console.log('User not found, creating new user');
      const newUser = new this.userModel({
        auth0Id,
        email,
        firstName: userData?.name?.split(' ')[0] || '',
        lastName: userData?.name?.split(' ').slice(1).join(' ') || '',
        picture: userData?.picture,
      });
    
      user = await newUser.save();
      console.log('New user created in MongoDB:', JSON.stringify(user, null, 2));
    } else {
      // Optionally update existing user with fresh data
      console.log('User found, checking if update needed');
      const updatedData = {
        email: email || user.email,
        firstName: userData?.name?.split(' ')[0] || user.firstName,
        lastName:
          userData?.name?.split(' ').slice(1).join(' ') || user.lastName,
        picture: userData?.picture || user.picture,
      };

      // Only update if there are changes
      const needsUpdate = Object.entries(updatedData).some(
        ([key, value]) => user && value !== user[key],
      );

      if (needsUpdate && user) {
        const updatedUser = await this.userModel
          .findOneAndUpdate({ auth0Id }, { $set: updatedData }, { new: true })
          .exec();

        if (updatedUser) {
          user = updatedUser;
          console.log('User updated in MongoDB:', user);
        }
      }
    }

    if (!user) {
      console.log('Failed to find or create user');
      throw new NotFoundException(
        `Failed to find or create user with Auth0 ID ${auth0Id}`,
      );
    }

    return user;
  }
}
