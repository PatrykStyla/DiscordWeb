import React, { useEffect, useRef, useState } from 'react';
import url from 'url';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	useHistory,
	useParams
} from "react-router-dom";
import { ChannelList } from './ChannelList';
export function GuildLogs() {
	const [channels, setChannels] = useState<TChannels[] | null>(null);
	let { guild_id } = useParams<{ guild_id: string }>()
	let [ChatLogs, setChatLogs] = useState<ChannelMessage[]>([])
	let [WsChat, setWsChat] = useState<string[] | null>(null)
	let [messages, setMessages] = useState<any[] | null>([])
	
	useEffect(() => {
		const ws = new WebSocket("wss://patrykstyla.com:9001")
		ws.addEventListener('open', function (event) {
			ws.send("id " + guild_id);
		});
		ws.addEventListener('message', (event) => {
			const JsonMessage = JSON.parse(event.data) as IBotMessage
			console.log(ChatLogs.concat(JsonMessage.message as any))	
			AddMessage(JsonMessage.message)
		})

		setInterval(() => {
			if (ws.readyState === ws.OPEN) {
				ws.send("keep alive")
			}
		}, 25000);
	
	},[])

	function AddMessage(message: any) {
		setChatLogs(messages => (messages!.concat(message)))
	} 


	// Get ALL channels
	useEffect(() => {
		fetch('/api/guilds/@channels', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
				// 'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: JSON.stringify({ channel_id: guild_id })
		})
			.then(res => res.json())
			.then((result: TChannels[]) => {
				setChannels(result);
			})
	}, [])


	if (channels) {
		return (
			<div className="flex">
				{/* Channel List */}
				<div className="flex-1">
					<ChannelList setChatLogs={setChatLogs} Channels={channels}/>
				</div>
				<div className="flex-1">
					{ChatLogs ? ChatLogs.map((element, key) => {
						return <div key={element.id}>{element.content}</div>
					}) : ""
				}
				</div>
			</div>
		)
	} else {
		return (
			<div className="flex">
			{/* Channel List */}
			<div className="flex-1">
				NOPE
			</div>
			<div className="flex-1">
	
			</div>
		</div>
		)
	}

}

export interface ChannelMessage {
	id: string,
	content: string,
	author: string,
	type: string,
	embeds?: string,
	attachments?: string,
	channel_id: string,
	is_pinned: boolean,
	is_deleted: boolean
}
interface GeneralChannels {
	bitrate: number
	channel_id: string
	is_deleted: number
	name: string
	nsfw: number
	position: number
	rate_limit_per_user: number
	recepient: string
	topic: string
	types: 'text' | 'voice' | 'category' | 'dm' | 'store' | 'news'
	user_limit: number
}

export type TChannels = ITextChannel | IVoiceChannel | ICategoryChannel | IStoreChannel | INewsChannel;

export interface IChannel {
	channel_id: string,
	is_deletd: number,
	// types: 'text' | 'voice' | 'category' | 'dm' | 'store' | 'news',
	position: number,
	parent: string,
	name: string
}

export interface ITextChannel extends IChannel {
	name: string,
	nsfw: number,
	rate_limit_per_user: number,
	position: number,
	topic: string,
	types: 'text'
}

export interface IVoiceChannel extends IChannel {
	name: string,
	position: number,
	user_limit: number,
	bitrate: number,
	types: 'voice'
}

export interface ICategoryChannel extends IChannel {
	name: string,
	position: number,
	types: 'category'
}

export interface IStoreChannel extends IChannel {
	name: string,
	position: number,
	types: 'store'
}

export interface INewsChannel extends IChannel {
	name: string,
	position: number,
	types: 'news'
}

interface IBotMessage {
	message: {
		id: string
		guild_id: string
		channel_id: string
		content: string
		author: string
	}
}