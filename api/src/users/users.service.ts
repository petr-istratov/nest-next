import { Injectable } from '@nestjs/common';
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
      user.parent = parent;
    }
    return this.dataSource.manager.save(user);
  }

  findAll(): Promise<User[]> {
    return this.dataSource.manager.getTreeRepository(User).findTrees({});
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.dataSource.manager.findOneBy(User, { id });

    if (updateUserDto.parentId) {
      const parent = await this.dataSource.manager.findOneBy(User, {
        id: updateUserDto.parentId,
      });
      // check if parent is null
      user.parent = parent;
    } else {
      user.parent = null;
    }
    user.position = updateUserDto.position;
    return this.dataSource.manager.save(user); /// try update
  }

  async remove(id: string): Promise<void> {
    await this.dataSource.manager.softDelete(User, id); // hooks clean
  }
}
