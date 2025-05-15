import { PartialType } from '@nestjs/mapped-types';
import { CreateLapDto } from './create-lap.dto';

export class UpdateLapDto extends PartialType(CreateLapDto) {}
