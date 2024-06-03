import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsOptional()
  @IsUUID(4)
  id?: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsNumber({ allowInfinity: false, allowNaN: false })
  @IsNotEmpty()
  position: number;

  @IsOptional()
  @IsUUID(4)
  parentId?: string;
}
