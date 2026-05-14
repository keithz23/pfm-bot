import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SpendService } from './spend.service';
import { CreateSpendDto } from './dto/create-spend.dto';
import { UpdateSpendDto } from './dto/update-spend.dto';

@Controller('spend')
export class SpendController {
  constructor(private readonly spendService: SpendService) {}

  
}
