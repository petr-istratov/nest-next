import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

ConfigModule.forRoot({ isGlobal: true });

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forRoot({
      ...(databaseConfig() as TypeOrmModuleOptions),
      entities: [User],
      synchronize: true, // not in production
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
