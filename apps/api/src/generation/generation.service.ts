import { Injectable } from '@nestjs/common';
import { CreateGenerationDto } from './dto/create-generation.dto';
import { UpdateGenerationDto } from './dto/update-generation.dto';

@Injectable()
export class GenerationService {
  create(createGenerationDto: CreateGenerationDto) {
    return 'This action adds a new generation';
  }

  findAll() {
    return `This action returns all generation`;
  }

  findOne(id: number) {
    return `This action returns a #${id} generation`;
  }

  update(id: number, updateGenerationDto: UpdateGenerationDto) {
    return `This action updates a #${id} generation`;
  }

  remove(id: number) {
    return `This action removes a #${id} generation`;
  }
}
