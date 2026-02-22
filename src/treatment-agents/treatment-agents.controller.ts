import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { TreatmentAgentsService } from './treatment-agents.service';
import { CreateTreatmentAgentDto } from './dto/create-treatment-agent.dto';
import { JwtGuard } from '../common/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';

@UseGuards(JwtGuard)
@Controller('api/v1/treatment-agents')
export class TreatmentAgentsController {
  constructor(private readonly svc: TreatmentAgentsService) {}

  @Get()
  findAll(
    @Query('category') category: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.findAllForUser(user.id, category || 'treatment');
  }

  @Post()
  create(
    @Body() dto: CreateTreatmentAgentDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.svc.create(dto, user.id);
  }
}
