import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    if (createUserDto.id) user.id = createUserDto.id;
    user.firstName = createUserDto.firstName;
    user.lastName = createUserDto.lastName;
    user.position = createUserDto.position;
    if (createUserDto.parentId) {
      const parent = await this.dataSource.manager.findOneBy(User, {
        id: createUserDto.parentId,
      });

      if (!parent) throw new HttpException('Parent not found', HttpStatus.NOT_FOUND);

      user.parent = parent;
    }
    return this.dataSource.manager.save(user);
  }

  findAll(): Promise<User[]> {
    return this.dataSource.manager.getTreeRepository(User).findTrees({});
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.dataSource.manager.findOneBy(User, { id });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    if (updateUserDto.parentId) {
      const parent = await this.dataSource.manager.findOneBy(User, {
        id: updateUserDto.parentId,
      });

      if (!parent) throw new HttpException('Parent not found', HttpStatus.NOT_FOUND);

      user.parent = parent;
    } else {
      user.parent = null;
    }
    user.position = updateUserDto.position;
    return this.dataSource.manager.save(user);
  }

  async remove(id: string) {
    const user = await this.dataSource.manager.findOneBy(User, { id });
    if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

    const descendants = await this.dataSource.manager.getTreeRepository(User).findDescendants(user);
    if (descendants.length > 1)
      throw new HttpException('User can not be deleted while there are subordinates attached', HttpStatus.FORBIDDEN);

    return this.dataSource.manager.softDelete(User, id);
  }
}
