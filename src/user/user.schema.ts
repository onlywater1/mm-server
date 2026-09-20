import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User> & {
  comparePassword(candidatePassword: string): Promise<boolean>;
};

@Schema({ timestamps: true })
export class User {
  //基础认证字段
  @Prop({ required: true })
  username: string;

  @Prop({ required: false })
  wechatId: string; //微信登陆唯一标识

  @Prop({ required: false })
  email?: string;

  @Prop({ required: false })
  phone: string;

  @Prop()
  avatar?: string;

  @Prop({ default: ['user'] })
  roles: string[]; //角色数组， 支持多角色

  @Prop({ default: true })
  isActive: boolean; // 账号是否激活

  @Prop()
  password: string;

  //个人信息
  @Prop()
  realName?: string; // ? 为可选属性

  @Prop({ enum: ['male', 'female', 'other'], default: 'other' })
  gender?: 'male' | 'female' | 'othre';

  @Prop()
  isCard: string; //身份证号

  @Prop({ default: false })
  isVerified: boolean; //是否实名认证

  @Prop()
  birthDate?: Date; //出生年月日

  //Vip相关
  @Prop({ default: false })
  isVip: boolean;

  @Prop()
  vipExpireTime?: Date; // 会员过期时间

  //配额相关
  @Prop({ default: 0 })
  aiInterviewRemainingCount: number; // Ai面试剩余次数

  @Prop({ default: 0 })
  aiInterviewRemianingMinutes: number; // AI模拟面试剩余时间（分钟）

  @Prop({ default: 0 })
  wwCoinBalance: number; // 旺旺币剩余

  @Prop({ default: 0 })
  resumeReaminingCount: number; //简历押题剩余次数

  @Prop({ default: 0 })
  specialReaminingCount: number; // 专项面试剩余次数

  @Prop({ default: 0 })
  bahavoirReaminingCount: number; // 综合面试剩余次数

  //用户行为踪迹

  @Prop()
  lastLoginTime?: Date; // 最近登陆时间

  @Prop()
  lastLoginLocation?: string; //最近登陆地点

  //微信相关字段
  @Prop({ unique: true, sparse: true })
  openid?: string; // 微信用户的唯一标识 -- 小程序

  @Prop({ unique: true, sparse: true })
  unionid?: string; // 微信开放平台统一标识

  @Prop()
  wechatNickName?: string; //微信昵称

  @Prop()
  wechatAvatar?: string; //微信头像

  @Prop({ default: false })
  isWechatBound: boolean; // 是否绑定微信

  @Prop()
  wechatBoundTime?: Date; // 微信绑定时间
}

export const UserSchema = SchemaFactory.createForClass(User);

//保存前加密
UserSchema.pre('save', async function () {
  // 一个钩子
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  if (this.password) {
    this.password = await bcrypt.hash(this.password, salt);
  }
});

//添加比较密码的方法
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
) {
  return await bcrypt.compare(candidatePassword, this.password);
};
