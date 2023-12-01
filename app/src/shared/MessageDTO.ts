import { MessageType } from "./MessageType";

export default interface MessageDTO {
	type: MessageType,
	message: string;
}