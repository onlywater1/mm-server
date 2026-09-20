import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './user.schema.js';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto.js';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto.js';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDTo: RegisterDto) {
    const { username, email, password } = registerDTo;

    //检查用户名是否已经存在
    const existingUser = await this.userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (existingUser) {
      throw new BadRequestException('用户名或者邮箱已经存在');
    }

    //创建新用户 密码是自动加密的
    const newUser = new this.userModel({
      username,
      email,
      password,
    });

    await newUser.save();

    //返回用户信息
    const result = newUser.toObject();
    const { password: newPassword, ...rest } = result; // 将password剥离出来，不返回
    return rest;
  }

  async login(LoginDto: LoginDto) {
    const { email, password } = LoginDto;

    //1、找用户
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('邮箱或密码不正确');
    }

    //2、验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码不正确');
    }

    //3、生成token
    const token = this.jwtService.sign({
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
    });

    //4、返回 token 与用户信息
    const userInfo = user.toObject();
    const { password: newPassword, ...rest } = userInfo;

    return {
      token,
      rest,
    };
  }
}
