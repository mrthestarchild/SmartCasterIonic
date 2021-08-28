import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Message } from 'src/models/message.model';

@Injectable({
  providedIn: 'root'
})
export class MessageQueueService {

  queuedMessages: BehaviorSubject<Array<Message>> = new BehaviorSubject<Array<Message>>(new Array<Message>());
  queuedMessages$: Observable<Array<Message>> = this.queuedMessages.asObservable();
  localQueuedMessages: Array<Message> = new Array<Message>();


  constructor() { }

  AddMessageToQueue(message: Message) {
    this.localQueuedMessages.push(message);
    this.queuedMessages.next(this.localQueuedMessages);
  }

  UpdateMessageQueue(messageList: Array<Message>) {
    this.queuedMessages.next(messageList);
  }

  GetMessageQueue() {
    return this.localQueuedMessages;
  }

}
