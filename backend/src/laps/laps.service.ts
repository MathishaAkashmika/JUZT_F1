import { Injectable } from '@nestjs/common';
import { CreateLapDto } from './dto/create-lap.dto';
import { UpdateLapDto } from './dto/update-lap.dto';

@Injectable()
export class LapsService {
  create(createLapDto: CreateLapDto) {
    return 'This action adds a new lap';
  }

  findAll() {
    return `This action returns all laps`;
  }

  findOne(id: number) {
    return `This action returns a #${id} lap`;
  }

  update(id: number, updateLapDto: UpdateLapDto) {
    return `This action updates a #${id} lap`;
  }

  remove(id: number) {
    return `This action removes a #${id} lap`;
  }
}
