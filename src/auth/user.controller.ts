import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRegisterDTO } from './dto/UserRegister.dto';
import { UserLoginDTO } from './dto/UserLogin.dto';
import { Response } from 'express';


@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("/register")
  async registerUser(@Body() dto: UserRegisterDTO){
    return await this.userService.regiter(dto)
  }

  @Post("/login")
  async loginUser(@Body() dto: UserLoginDTO){
    return await this.userService.login(dto)
  }

  @Get("/session/verify/:id")
  async verifySession(@Param("id") userId: number, @Res() response: Response){
    const haveSession = await this.userService.verifySession(userId)
    if(haveSession){
      return response.status(HttpStatus.OK).json({access_token: haveSession});
    }
    return response.status(HttpStatus.FORBIDDEN).json({ access_token: false });
  }

  @Get("/session/logout/:id")
  async logoutSession(@Param("id") userId: number, @Res() response: Response){
    const logout = await this.userService.logout(userId)
    return response.status(logout ? HttpStatus.OK : HttpStatus.BAD_REQUEST).json({success: logout ? true : false});
  }

  @Get("/session/refresh/:id")
  async refreshSession(@Param("id") userId: number, @Res() response: Response){
    const sessionRefresh = await this.userService.refreshToken(userId);
    if(sessionRefresh){
      return response.status(HttpStatus.OK).json(sessionRefresh)
    }

    return response.status(HttpStatus.BAD_REQUEST).json({success: false});
  }
}
