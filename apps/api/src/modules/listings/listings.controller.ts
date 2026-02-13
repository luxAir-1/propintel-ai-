import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ListingsService } from './listings.service';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('Listings')
@ApiBearerAuth()
@Controller('listings')
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new listing' })
  async create(@CurrentUser('sub') userId: string, @Body() data: any) {
    return this.listingsService.create(userId, data);
  }

  @Get()
  @ApiOperation({ summary: 'List user listings with pagination' })
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
  @ApiOperation({ summary: 'Search listings by criteria' })
  async search(@CurrentUser('sub') userId: string, @Query() criteria: any) {
    return this.listingsService.search(userId, criteria);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get listing details' })
  async getOne(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.listingsService.findById(userId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update listing' })
  async update(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.listingsService.update(userId, id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete listing' })
  async delete(@CurrentUser('sub') userId: string, @Param('id') id: string) {
    return this.listingsService.delete(userId, id);
  }
}
