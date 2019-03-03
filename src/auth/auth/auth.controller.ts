import { Controller, Post, Body, Param, Get, Res } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../user.entity';
import { UserService } from '../user.service';
import { UseInterceptors, FileInterceptor, UploadedFile } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
  SERVER_URL: string = "http://localhost:3000/";

  constructor(private readonly authService: AuthService, private userService: UserService) { }

  @Post('login')
  async login(@Body() user: User): Promise<any> {
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() user: User): Promise<any> {
    return this.authService.register(user);
  }


  @Post(':userid/avatar')
  @UseInterceptors(FileInterceptor('file',
    {
      storage: diskStorage({
        destination: './avatars',

        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
          return cb(null, `${randomName}${extname(file.originalname)}`)
        }
      })
    }
  )
  )
  uploadAvatar(@Param('userid') userId, @UploadedFile() file) {

    this.userService.setAvatar(Number(userId), `${this.SERVER_URL}${file.path}`);

  }

  @Get('avatars/:fileId')
  async serveAvatar(@Param('fileId') fileId, @Res() res): Promise<any> {
    res.sendFile(fileId, { root: 'avatars' });
  }
}
