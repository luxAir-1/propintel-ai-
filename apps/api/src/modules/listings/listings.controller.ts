import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Listings')
@ApiBearerAuth()
@Controller('listings')
export class ListingsController {
  constructor(
    private listingsService: ListingsService,
    private subscriptionsService: SubscriptionsService,
  ) {}

  @Post()
  async create(@CurrentUser('sub') userId: string, @Body() data: any) {
    // Check usage limits
    const canCreate = await this.subscriptionsService.canCreateListing(userId);
    if (!canCreate) {
      const limits = await this.subscriptionsService.getUsageLimits(userId);
      throw new ForbiddenException(
        `Listing limit reached (${limits.maxListings}). Please upgrade your plan.`
      );
    }

    return this.listingsService.create(userId, data);
  }

  @Get()
  async list(
    @CurrentUser('sub') userId: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {
    return this.listingsService.findMany(userId, {
      skip: skip ? parseInt(String(skip)) : 0,
      take: take ? parseInt(String(take)) : 20,
      city,
      state,
      minPrice: minPrice ? parseInt(String(minPrice)) : undefined,
      maxPrice: maxPrice ? parseInt(String(maxPrice)) : undefined,
    });
  }

  @Get('search')
  async search(@CurrentUser('sub') userId: string, @Query() criteria: any) {
    return this.listingsService.search(userId, criteria);
  }

  @Get(':id')
  async getOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.listingsService.findById(userId, id);
  }

  @Patch(':id')
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.listingsService.update(userId, id, data);
  }

  @Delete(':id')
  async delete(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.listingsService.delete(userId, id);
  }
}
