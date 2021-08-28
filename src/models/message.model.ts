import { MessageQueueType } from "../utils/message-queue-type.enum";

/**
 * Defines a message to be added to the message queue
 */
export class Message {
    /**
     * Defines the message queue color that it will display.
     * 
     * Defaults to "Danger" 
     */
    MessageQueueType: MessageQueueType = MessageQueueType.Danger;
    /**
     * The message that will be display to the end user
     */
    UserMessage: string;
    /**
     * If true then message will display in list.
     * 
     * If false the message will not be displayed and should be removed from queue
     * 
     * Defaults to true 
     */
    ShouldShow: boolean = true;
}
