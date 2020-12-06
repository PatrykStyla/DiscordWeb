import React, { createRef, useCallback, useEffect, useRef, useState } from 'react';
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
import { IBotMessage, IMessageDeletePayload, IMessageEditPayload, IMessagePayload, IMessageTypeEnum } from '../../components/Interfaces';

export function GuildLogs() {
	const [channelsID, setChannelsID] = useState<TChannels[] | null>(null);
	const { guild_id } = useParams<{ guild_id: string }>()
	const [SelectedID, setSelectedID] = useState<{ id: string | null, type: 'text' | 'voice' | 'category' | 'dm' | 'store' | 'news' | null } >
		({ id: window.localStorage.getItem("SelectedChannelId") ? window.localStorage.getItem("SelectedChannelId") : null,
		   type: window.localStorage.getItem("SelectedChannelType") as any ? window.localStorage.getItem("SelectedChannelType") as any : null});
	// Some state to save the messages of all channels after they have been loaded.
	//														 channel_id   message_id  message
	let [ChannelMessages, SetChannelMessages] = useState<Map<string, Map<string,ChannelMessage> | null>>(new Map());
	const ws = useRef<WebSocket | null>(null);
    const ChannelRefMap = useRef<Map<string,HTMLDivElement | null>>(new Map());

	useEffect(() => {
		let KeepAlive: NodeJS.Timeout
		function connect() {
			ws.current = new WebSocket("wss://patrykstyla.com:9001")
			ws.current.onopen = () => {
				ws.current!.send(("id " + guild_id));
			};
			ws.current.onerror = ((event) => {
				// Prevents exceptions
			})
			ws.current.onclose = (event) => {
				console.log('Socket is closed. Reconnect will be attempted in 1 second.', event.reason);
				setTimeout(() => {
					connect()
				}, 1000);
			}
		}

		KeepAlive = setInterval(() => {
			if (ws.current) {
				if (ws.current.readyState === ws.current.OPEN) {
					// Keep alive message
					ws.current.send("")
				}
			}
		}, 25000);

		connect()		
		return function cleanup() {
			// destroy ws
			// WebSocket.close() waits to close the connection while the cleanup runs instantly
			// this causes the event listeners to stay and try to reconnect to the socket
			ws.current!.onclose = () => {};
			ws.current!.close(1000)
			// Clean interval
			clearInterval(KeepAlive);
		}
	}, [])

	// 
	useEffect(() => {
		if (!ws.current){
			return;
		}

		ws.current.onmessage = ((event) => {
			const JsonMessage = JSON.parse(event.data) as IBotMessage
			if (JsonMessage.p.t === IMessageTypeEnum.Message) {
				AddMessage(JsonMessage.p)
			} else if (JsonMessage.p.t === IMessageTypeEnum.MessegeDelete) {
				DeleteMessage(JsonMessage.p)
			} else if (JsonMessage.p.t === IMessageTypeEnum.MessageEdit) {
				EditMessage(JsonMessage.p)
			} else {
				console.log('Unhandled WebSocket message type')
			}
		});
	},[ChannelMessages, SelectedID])
	const EditMessage = (payload: IMessageEditPayload) => {
		SetChannelMessages((Messages) => (new Map(
			Messages.set(payload.channel_id, Messages.get(payload.channel_id)!
			.set(payload.id, {...Messages
				.get(payload.channel_id)!
				.get(payload.id)!, is_edited: true, content: payload.content} 
			)))
		))
	}
	const DeleteMessage = (payload: IMessageDeletePayload) => {
		const start = performance.now()
		const a = ChannelMessages.set(payload.channel_id, ChannelMessages.get(payload.channel_id)!
		.set(payload.id, {...ChannelMessages!
			.get(payload.channel_id)!
			.get(payload.id)!, is_deleted: true} ))
			
		SetChannelMessages((Messages) => (new Map(
			Messages.set(payload.channel_id, Messages.get(payload.channel_id)!
			.set(payload.id, {...Messages
				.get(payload.channel_id)!
				.get(payload.id)!, is_deleted: true} 
			)))
		))
		console.log("Message DLETE", performance.now() - start)
	}
	const AddMessage = (payload: IMessagePayload) => {
		// Check if we have that channel laoded
		if (ChannelMessages.get(payload.channel_id)) {
			// TODO: proper interface
			// SetChannelMessages((messages) => ({ ...messages, [payload.channel_id]: [...messages[payload.channel_id]!, (payload as any)]}))
			SetChannelMessages((Messages) => (new Map(Messages.set(payload.channel_id, Messages.get(payload.channel_id)!
			.set(payload.id, payload as any)))))

		} else {
			// Channel was not loaded. Do not add the message
			console.log('CHANNEL NOT LOADED')
		}
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
				setChannelsID(result);
			})
	}, [])
	// TODO?: Get ALL users from DB
	useEffect(() => {

	})
	if (channelsID) {
		return (
			<div className="flex">
				{/* Channel List */}
				<div className="flex truncate w-56">
					<ChannelList selectedChannel={SelectedID} setSelectedChannel={setSelectedID} Channels={channelsID} />
				</div>
				<div className="flex flex-1">
					<TextChannelSelected ChannelRefMap={ChannelRefMap} selectedChannel={SelectedID} ChannelMessages={ChannelMessages} SetChannelMessages={SetChannelMessages} />
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

function MemberStatus() {
	return (
		<div className="flex flex-initial w-40">member status here????</div>
	)
}

function TextLikeChannel(props: {
	ChannelRefMap: React.MutableRefObject<Map<string, HTMLDivElement | null>>,
	SelectedTextChannel: Map<string, ChannelMessage>,
	SelectedChannel: string}
	) 
{
	const start = performance.now()
	let a: JSX.Element[] = []
	props.SelectedTextChannel.forEach((element, key) => {
		if (element.attachments) {
			a.push(<div ref={el => props.ChannelRefMap.current.set(element.id, el)} className="flex-1" key={key}>Is an attachment =&gt;  {element.attachments}</div>)
		} else if (element.embeds) {
			a.push(<div className="flex-1" key={key}>Is an embed =&gt;  {element.embeds}</div>)
		} else {
			if (element.is_deleted) {
				a.push(<div className="flex-1" key={key}>{element.content} IS DELETED</div>)	
			} else if (element.is_edited) {
				a.push(<div className="flex-1" key={key}>{element.content} IS EDITED</div>)	
			} else if (element.is_pinned) {
				a.push(<div className="flex-1" key={key}>{element.content} IS PINNED</div>)	
			} else {
				// normal message
				a.push(<div className="flex-1" key={key}>{element.content}</div>)	
			}
		}
	})

	console.log("Message Handle", performance.now() - start)
	return (
		<>
			{a}	
		</>
	)
}

export function TextChannelSelected(props:{ selectedChannel:{
			id: string | null;
			type: 'text' | 'voice' | 'category' | 'dm' | 'store' | 'news' | null;
		},
		ChannelRefMap: React.MutableRefObject<Map<string, HTMLDivElement | null>>,
		ChannelMessages: 
			Map<string, Map<string, ChannelMessage> | null>,
		 SetChannelMessages: React.Dispatch<React.SetStateAction<Map<string, Map<string, ChannelMessage> | null>>>
		}) 
	{


	// Get the channel messages when this channel is selected
	useEffect(() => {
		// On load fetch only if we have a channel selected
		// TODO: Once a channel is loaded add it to state AND don't load it anymore
		// TODO: Add messages from the websocket
		if (props.selectedChannel.id) {
			// Don't fetch anything if state is not set
			// OR the selected channel is not a text channel
			if (!props.selectedChannel || props.selectedChannel.type === "category" || props.selectedChannel.type === "voice") {
				console.log('nope')
				return;
			}
			// We have that channel don't fetch it
			if (props.ChannelMessages.has(props.selectedChannel.id)) {
				return;
			}
			fetch(`/api/channels/${props.selectedChannel.id}/messages`, {
				method: 'GET',
			})
				.then(res => res.json())
				.then((result: ChannelMessage[]) => {
					// Set empty results as null
					if (result.length !== 0) {
						let a = new Map()
						result.forEach((values, index) => {
							a.set(values.id, values)
						})
						props.SetChannelMessages((messages) => (new Map(messages.set(props.selectedChannel.id!, a as any))))
						// props.ChannelRefMap.
					} else {
						props.SetChannelMessages((messages) => (new Map(messages.set(props.selectedChannel.id!, null))))
					}
				})
		}
	}, [props.selectedChannel])

	// TODO: Improve logic
	if (props.ChannelMessages.get(props.selectedChannel.id!) && props.selectedChannel.id) {
		return (
			<>
				<div className="flex-1">
					<TextLikeChannel ChannelRefMap={props.ChannelRefMap} SelectedChannel={props.selectedChannel.id} SelectedTextChannel={props.ChannelMessages.get(props.selectedChannel.id!)!}/>
				</div>
				<MemberStatus />
			</>
		)
	}
	return (
		<div className="flex-1">Select a Channel or no messages</div>
	)
}

export interface ChannelMessage {
	id: string,
	content: string,
	author: string,
	type: string,
	embeds?: string,
	attachments?: string,
	channel_id: string,
	is_edited: boolean
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

