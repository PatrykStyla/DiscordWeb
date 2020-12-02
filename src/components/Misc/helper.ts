import React from 'react';
import { Map } from 'immutable'

import { ChannelMessage } from 'components/Dashboard/GuildLogs';
import { IMessageDeletePayload } from 'components/Interfaces';

export function MutateMapArray(SetChannelMessages: React.Dispatch<React.SetStateAction<Map<string, ChannelMessage[] | null>>>,
	ChannelMessages: Map<string, ChannelMessage[] | null>,
	payload: IMessageDeletePayload,
	mutator : 'is_deleted' | 'is_edited' | 'is_pinned') 
	{
	let array = [...ChannelMessages.get(payload.channel_id)!]
	const index = array.findIndex(message => message.id === payload.id)!
	let object = {...array[index]}
	object[mutator] = true;
	array[index] = object;

	SetChannelMessages(ChannelMessages.set(payload.channel_id, array))
}