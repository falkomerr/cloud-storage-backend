import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { hash } from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity) private repository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string) {
    return this.repository.findOneBy({
      email,
    });
  }

  async findById(id: number) {
    return this.repository.findOneBy({
      id,
    });
  }

  async create(dto: CreateUserDto) {
    const userExists = await this.findByEmail(dto.email);

    if (userExists) {
      throw new ConflictException('User with the same email already exists');
    }

    const user = await this.repository.save({
      email: dto.email,
      password: await hash(dto.password),
      fullName: dto.fullName,
    });
    return {
      email: user.email,
      fullName: user.fullName,
      id: user.id,
    };
  }
}
