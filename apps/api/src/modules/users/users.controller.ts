import { Controller, Get, Patch, Delete, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() data: any,
  ) {
    return this.usersService.update(userId, data);
  }

  @Delete('me')
  @ApiOperation({ summary: 'Delete user account' })
  async deleteAccount(@CurrentUser('sub') userId: string) {
    return this.usersService.delete(userId);
  }

  @Get('usage')
  @ApiOperation({ summary: 'Get user usage statistics' })
  async getUsage(@CurrentUser('sub') userId: string) {
    return this.usersService.getUsageStats(userId);
  }
}
