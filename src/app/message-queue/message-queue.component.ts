import { Component, OnInit } from '@angular/core';
import { Message } from 'src/models/message.model';
import { MessageQueueService } from 'src/services/message-queue.service';

@Component({
  selector: 'app-message-queue',
  templateUrl: './message-queue.component.html',
  styleUrls: ['./message-queue.component.scss'],
})
export class MessageQueueComponent implements OnInit {

  messageList: Array<Message> = new Array<Message>();

  constructor(private _messageQueueService: MessageQueueService) {
    this._messageQueueService.queuedMessages$.subscribe(messageList => {
      this.messageList = messageList;
    });
  }

  ngOnInit() {}

  /**
   * Closes message and removes it from the message queue.
   * @param index 
   */
  DismissMessage(index: number) {
    this.messageList[index].ShouldShow = false;
    this._messageQueueService.UpdateMessageQueue(this.messageList);
  }

}
