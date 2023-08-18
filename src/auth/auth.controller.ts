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
      },
    });
  }

  @Post('/register')
  @ApiBody({ type: CreateUserDto })
  async register(@Body() dto: CreateUserDto, @Response() res) {
    const data = await this.authService.register(dto);

    res.cookie('refreshToken', data.refreshToken, {
      httpOnly: true,
    });

    return res.status(200).json({
      accessToken: data.accessToken,
      user: {
        email: data.email,
      },
    });
  }

  @Get('/refreshToken')
  async refreshToken(@Request() req, @Response() res) {
    const refresh: string = req.cookies['refreshToken'];

    const { accessToken, id } = await this.authService.generateAccess(refresh);
    const newRefresh = await this.authService.generateRefresh(id);

    res.cookie('refreshToken', newRefresh, {
      httpOnly: true,
    });

    return res.status(200).json({
      accessToken: accessToken,
    });
  }

  @Get('/logout')
  async logOut(@Response() res, @Request() req) {
    if (req.cookies['refreshToken']) {
      res.clearCookie('refreshToken');
      res.status(200).send('Logout');
    } else {
      res.status(401).send('Unathorized');
    }
  }
}
