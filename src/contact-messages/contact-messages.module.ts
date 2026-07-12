import { Module } from '@nestjs/common';
import { AdminContactMessagesController } from './admin-contact-messages.controller';
import { ContactMessagesController } from './contact-messages.controller';
import { ContactMessagesService } from './contact-messages.service';

@Module({
  controllers: [ContactMessagesController, AdminContactMessagesController],

  providers: [ContactMessagesService],

  exports: [ContactMessagesService],
})
export class ContactMessagesModule {}
