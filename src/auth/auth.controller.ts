import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LocalAuthGuard } from './guards/local.guard';
import * as process from 'process';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  @ApiBody({ type: CreateUserDto })
  async login(@Request() req, @Response() res) {
    const data = await this.authService.login(req.user);

    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
    });

    return res.status(200).json({
      accessToken: data.accessToken,
      user: {
        email: data.email,
        fullName: data.fullName,
      },
    });
  }

  @Post('/register')
  @ApiBody({ type: CreateUserDto })
  async register(@Body() dto: CreateUserDto, @Response() res) {
    const data = await this.authService.register(dto);

    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
      domain: process.env.CLIENT_URL,
    });

    return res.status(200).json({
      accessToken: data.accessToken,
      user: {
        email: data.email,
        fullName: data.fullName,
      },
    });
  }

  @Get('/refreshToken')
  @ApiBody({ type: CreateUserDto })
  async refreshToken(@Request() req, @Response() res) {
    const refresh: string = req.cookies['refreshToken'];

    const { accessToken, id } = await this.authService.generateAccess(refresh);
    const newRefresh = await this.authService.generateRefresh(id);

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
      domain: process.env.CLIENT_URL,
    });

    return res.status(200).json({
      accessToken: accessToken,
    });
  }
}
