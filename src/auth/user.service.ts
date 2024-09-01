import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRegisterDTO } from './dto/UserRegister.dto';
import { hashPassword, verifyPassword } from '../helper/password.helper';
import { UserLoginDTO } from './dto/UserLogin.dto';
import { JwtService } from '@nestjs/jwt';
import { RedisProvider } from 'src/config/redis.provider';
import { config } from 'dotenv';

config()
@Injectable()
export class UserService {
  constructor(
    @Inject('USER_REPOSITORY')
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private redis: RedisProvider
  ) {}

  private readonly ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET
  private readonly REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET

  private readonly ACCESS_TOKEN_EXP = process.env.JWT_ACCESS_TOKEN_EXP
  private readonly REFRESH_TOKEN_EXP = process.env.JWT_REFRESH_TOKEN_EXP

  async regiter(registerDto: UserRegisterDTO){
    try{
      return await this.userRepository.save({
        email: registerDto.email,
        name: registerDto.username,
        passwordHash: hashPassword(registerDto.password)
      })
    } catch(err){
      if(err.driverError.code == "ER_DUP_ENTRY"){
        return {
          err: "email já registrado"
        }
      }
    }
  }

  async login(dto: UserLoginDTO){
    const userExists = await this.userRepository.findOneBy({
      email: dto.email
    })

    if(!userExists){
      return {
        err: "Usuario não encontrado"
      }
    }

    const validPassword = await verifyPassword(userExists.passwordHash, dto.password)

    if(!validPassword){
      return {
        err: "Senha invalida"
      }
    }

    const payload = { sub: userExists.id, username: userExists.name };
    const token = await this.jwtService.signAsync(payload, {secret: this.ACCESS_TOKEN_SECRET, expiresIn: this.ACCESS_TOKEN_EXP})
    const refreshTokenPayload = { sub: userExists.id }
    const refreshToken = await this.jwtService.signAsync(refreshTokenPayload, {secret: this.REFRESH_TOKEN_SECRET, expiresIn: this.REFRESH_TOKEN_EXP})
    this.redis.setValue(userExists.id+"", token, 60)
    return {
      access_token: token,
      refresh_token: refreshToken
    };
  }

  async verifySession(userId: number){
    const userHaveSession = await this.redis.getValue(userId+"")
    if(userHaveSession){
     try{
      await this.jwtService.verifyAsync(userHaveSession, {secret: this.ACCESS_TOKEN_SECRET})
      return userHaveSession
     } catch(err){
      console.log(err)
      return false
     };
    }
    return false;
  }

  async logout(userId: number){
    try{
      const haveSession = await this.redis.getValue(userId+"")
      if(!haveSession){
        return false;
      }
      await this.redis.delValue(userId+"")
      return true;
    } catch(err){
      console.log(err)
      return false;
    }
  }

  async refreshToken(userId: number){
    const userExists = await this.userRepository.findOneBy({
      id: userId
    })

    if(!userExists){
      return {
        err: "Usuario não encontrado"
      }
    }

    const payload = { sub: userExists.id, username: userExists.name };
    const token = await this.jwtService.signAsync(payload, {secret: this.ACCESS_TOKEN_SECRET, expiresIn: this.ACCESS_TOKEN_EXP})
    this.redis.setValue(userExists.id+"", token, 60)
    return {
      access_token: token
    };
  }
}
