import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { verify } from 'argon2';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as process from 'process';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async generateAccess(refreshToken: string) {
    const decodedToken = await this.jwtService.verifyAsync(refreshToken, {
      secret: process.env.SECRET_KEY,
    });
    const expiration = new Date();
    expiration.setDate(expiration.getMinutes() + 15);

    const access = this.jwtService.sign(
      { id: decodedToken.id },
      {
        secret: process.env.SECRET_KEY,
        expiresIn: expiration.getTime(),
      },
    );
    return {
      accessToken: access,
      id: decodedToken.id,
    };
  }

  async generateRefresh(id: number) {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);

    const token = this.jwtService.sign(
      { id: id },
      {
        secret: process.env.SECRET_KEY,
        expiresIn: expiration.getTime(),
      },
    );
    return token;
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    const verifyPassword = await verify(user.password, password);

    if (user && verifyPassword) {
      const { password, ...result } = user;
      return result;
    }

    if (!verifyPassword) {
      throw new UnauthorizedException('Incorrect password');
    }

    if (!user) {
      throw new BadRequestException('User does not exist');
    }
  }

  async register(dto: CreateUserDto) {
    const user = await this.userService.create(dto);

    const refresh = await this.generateRefresh(user.id);
    const access = await this.generateAccess(refresh);

    return {
      accessToken: access,
      refreshToken: refresh,
      fullName: user.fullName,
      email: user.email,
    };
  }

  async login(dto: UserEntity) {
    const user = await this.userService.findById(dto.id);

    const refresh = await this.generateRefresh(user.id);
    const { accessToken } = await this.generateAccess(refresh);

    return {
      accessToken: accessToken,
      refreshToken: refresh,
      fullName: user.fullName,
      email: user.email,
    };
  }
}
