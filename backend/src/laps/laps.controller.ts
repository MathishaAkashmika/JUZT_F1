import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LapsService } from './laps.service';
import { CreateLapDto } from './dto/create-lap.dto';
import { UpdateLapDto } from './dto/update-lap.dto';

@Controller('laps')
export class LapsController {
  constructor(private readonly lapsService: LapsService) {}

  @Post()
  create(@Body() createLapDto: CreateLapDto) {
    return this.lapsService.create(createLapDto);
  }

  @Get()
  findAll() {
    return this.lapsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lapsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLapDto: UpdateLapDto) {
    return this.lapsService.update(+id, updateLapDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lapsService.remove(+id);
  }
}
