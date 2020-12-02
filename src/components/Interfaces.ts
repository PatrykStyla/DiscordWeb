enum IMessageTypeEnum {
	Message,
	MessageUpdate,
	Remove,
	MessegeDelete,
	MessegeDeleteBulk,
	MessageEdit,
	MessageReactionAdd,
	MessageReactionRemove,
	MessageReactionRemoveAll,
}

export interface IMessagePayload {
	t: IMessageTypeEnum.Message
	id: string
	guild_id: string
	channel_id: string
	content: string
	author: string

}

export interface IMessageUpdatePayload {
	t: IMessageTypeEnum.MessageUpdate
}
export interface IMessageRemovePayload {
	t: IMessageTypeEnum.Remove
}

export interface IMessageDeletePayload {
	t: IMessageTypeEnum.MessegeDelete
	id: string,
	guild_id: string,
	channel_id: string,
	executor: string | null,
	is_deleted: boolean
}

export interface IMessageDeleteBulkPayload {
	t: IMessageTypeEnum.MessegeDeleteBulk
}

export interface IMessageEditPayload {
	t: IMessageTypeEnum.MessageEdit
}

export interface IMessageReactionAddPayload {
	t: IMessageTypeEnum.MessageReactionAdd
}

export interface IMessageReactionRemovePayload {
	t: IMessageTypeEnum.MessageReactionRemove
}

export interface IMessageReactionRemoveAllPayload {
	t: IMessageTypeEnum.MessageReactionRemoveAll
}

/**
 * The most generic message we can receive
 * access p => t IMessageTypeEnum.<type> to get the proper message
 */
interface IBotMessage {
	p: IMessagePayload | IMessageUpdatePayload | IMessageDeleteBulkPayload | IMessageDeletePayload | IMessageRemovePayload | IMessageEditPayload | IMessageReactionAddPayload
	| IMessageReactionRemovePayload | IMessageReactionRemoveAllPayload
} 

export { IMessageTypeEnum, IBotMessage}