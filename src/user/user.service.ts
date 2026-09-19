import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './user.schema.js';
import { Model } from 'mongoose';
import { RegisterDto } from './dto/register.dto.js';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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
}
