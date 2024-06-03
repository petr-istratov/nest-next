import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsNumber, IsOptional, IsUUID } from 'class-validator';

import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsUUID(4)
  parentId: string;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsNotEmpty()
  position: number;
}
