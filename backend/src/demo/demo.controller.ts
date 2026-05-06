import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { DemoService, DemoState } from './demo.service';

@Controller('demo')
export class DemoController {
  constructor(private readonly demo: DemoService) {}

  @Get('state')
  getState(): DemoState {
    return this.demo.getState();
  }

  @Post('consent')
  setConsent(@Body() body: { enabled: boolean }) {
    return this.demo.setConsent(!!body.enabled);
  }

  @Post('tasks')
  addTask(@Body() body: { title: string }) {
    return this.demo.addTask(body.title || 'Untitled task');
  }

  @Patch('tasks/:id/toggle')
  toggleTask(@Param('id') id: string) {
    return this.demo.toggleTask(id);
  }

  @Post('notes')
  addNote(@Body() body: { text: string; audience: 'family' | 'staff'; author?: string }) {
    return this.demo.addNote(body.text || '', body.audience || 'family', body.author || 'You');
  }
}
