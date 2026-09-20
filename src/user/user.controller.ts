import { Controller, Post, Body } from '@nestjs/common';
import { UserService } from './user.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { ResponseUtil } from '../common/utils/response.util.js';
import { LoginDto } from './dto/login.dto.js';
@Controller('user')
export class UserController {
  constructor(private readonly UserService: UserService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.UserService.register(registerDto);
    return ResponseUtil.success(result, '注册成功');
  }

  @Post('login')
  async login(@Body() LoginDto: LoginDto) {
    const result = await this.UserService.login(LoginDto);

    return ResponseUtil.success(result, '登陆成功');
  }
}
