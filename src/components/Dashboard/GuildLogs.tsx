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
import { IBotMessage, IMessageDeletePayload, IMessagePayload, IMessageTypeEnum } from '../../components/Interfaces';
import { Map } from 'immutable'
import { MutateMapArray } from '../../components/Misc/helper';

export function GuildLogs() {
	const [channelsID, setChannelsID] = useState<TChannels[] | null>(null);
	const { guild_id } = useParams<{ guild_id: string }>()
	const [SelectedID, setSelectedID] = useState<{ id: string | null, type: 'text' | 'voice' | 'category' | 'dm' | 'store' | 'news' | null } >
		({ id: window.localStorage.getItem("SelectedChannelId") ? window.localStorage.getItem("SelectedChannelId") : null,
		   type: window.localStorage.getItem("SelectedChannelType") as any ? window.localStorage.getItem("SelectedChannelType") as any : null});
	// Some state to save the messages of all channels after they have been loaded.
	const [ChannelMessages, SetChannelMessages] = useState<Map<string,ChannelMessage[] | null>>(Map());
	const ws = useRef<WebSocket | null>(null);

    const ChannelRef = useRef<HTMLDivElement[] | null[]>([null]);
    const ChannelRefMap = useRef<Map<string,HTMLDivElement | null>>(Map());

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
			console.log('Clean')
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
			console.log('WS is null')
			return;
		}

		ws.current.onmessage = ((event) => {
			const JsonMessage = JSON.parse(event.data) as IBotMessage
			if (JsonMessage.p.t === IMessageTypeEnum.Message) {
				AddMessage(JsonMessage.p)
			} else if (JsonMessage.p.t === IMessageTypeEnum.MessegeDelete) {
				const start = performance.now()
				DeleteMessage(JsonMessage.p)
				console.log("Message DLETE", performance.now() - start)
			} else {
				console.log('Unhandled WebSocket message type')
			}
		});
		
	},[ChannelMessages, SelectedID])
	const DeleteMessage = (payload: IMessageDeletePayload) => {
		// Mutate a single property value
		MutateMapArray(SetChannelMessages, ChannelMessages, payload, "is_deleted")
	}
	Math.floor
	const AddMessage = (payload: IMessagePayload) => {
		console.log(ChannelMessages)
		// Check if we have that channel laoded
		if (ChannelMessages.get(payload.channel_id)) {
			// TODO: proper interface
			// SetChannelMessages((messages) => ({ ...messages, [payload.channel_id]: [...messages[payload.channel_id]!, (payload as any)]}))
			SetChannelMessages(ChannelMessages.set(payload.channel_id, [...ChannelMessages.get(payload.channel_id)!, payload as any]))

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
				<button onClick={() => {console.log(ChannelRefMap.current.get("783148053426339861")!)}}>CLICK</button>
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
	SelectedTextChannel: ChannelMessage[],
	SelectedChannel: string}
	) 
{
	const start = performance.now()
	const a = props.SelectedTextChannel.map((element, key) => {
		if (element.attachments) {
			return (<div ref={el => props.ChannelRefMap.current.set(element.id, el)} className="flex-1" key={key}>Is an attachment =&gt;  {element.attachments}</div>)
		} else if (element.embeds) {
			return (<div className="flex-1" key={key}>Is an embed =&gt;  {element.embeds}</div>)
		} else {
			if (element.is_deleted) {
				return (<div className="flex-1" key={key}>{element.content} IS DELETED</div>)	
			} else if (element.is_edited) {
				return (<div className="flex-1" key={key}>{element.content} IS EDITED</div>)	
			} else if (element.is_pinned) {
				return (<div className="flex-1" key={key}>{element.content} IS PINNED</div>)	
			} else {
				// normal message
				return (<div className="flex-1" key={key}>{element.content}</div>)	
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
			Map<string, ChannelMessage[] | null>,
		 SetChannelMessages: React.Dispatch<React.SetStateAction<Map<string, ChannelMessage[] | null>>>
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
						props.SetChannelMessages((messages) => (messages.set(props.selectedChannel.id!, result)))
						// props.ChannelRefMap.
					} else {
						props.SetChannelMessages((messages) => (messages.set(props.selectedChannel.id!, null)))
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

