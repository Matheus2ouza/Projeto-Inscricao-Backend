import { Controller, Get } from '@nestjs/common';
import { UserId } from 'src/infra/web/authenticator/decorators/user-id.decorator';
import { UserInfo } from 'src/infra/web/authenticator/decorators/user-info.decorator';
import { UserRole } from 'src/infra/web/authenticator/decorators/user-role.decorator';

@Controller('users')
export class UserProfileRoute {
  @Get('profile')
  public async getProfile(@UserId() userId: string) {
    return {
      message: 'Profile endpoint - userId only',
      userId,
    };
  }

  @Get('profile-with-role')
  public async getProfileWithRole(
    @UserId() userId: string,
    @UserRole() userRole: string,
  ) {
    return {
      message: 'Profile endpoint - userId and userRole',
      userId,
      userRole,
    };
  }

  @Get('profile-complete')
  public async getProfileComplete(
    @UserInfo() userInfo: { userId: string; userRole: string },
  ) {
    return {
      message: 'Profile endpoint - complete user info',
      userInfo,
    };
  }
}
