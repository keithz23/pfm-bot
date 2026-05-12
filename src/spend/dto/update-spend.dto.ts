import { PartialType } from '@nestjs/mapped-types';
import { CreateSpendDto } from './create-spend.dto';

export class UpdateSpendDto extends PartialType(CreateSpendDto) {}
