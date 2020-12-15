import React, { createRef, useCallback, useEffect, useRef, useState } from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	useHistory,
	useParams
} from "react-router-dom";
import { ChannelList } from './ChannelList';
import { IBotMessage, IMessageDeletePayload, IMessageEditPayload, IMessagePayload, IMessageTypeEnum } from '../../../../DiscordBotJS/src/Interfaces';
import { DiscordBotJS } from "../../../../DiscordBotJS/ProtoOutput/bundle";
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
	const [GuildUsersMap, SetGuildUsersMap] = useState<Map<string,GuildUsers> | null>(new Map());
	/** We will scroll to this Div */
	const ScrollToRef = useRef<HTMLDivElement | null>(null)
	/** The actual div that does the scrolling. Attach onScroll listener */
	const ScrollRef = useRef<HTMLDivElement | null>(null)
	const [IsAtTheBottomOfMessages, SetIsAtTheBottomOfMessages] = useState<Map<string, boolean>>(new Map());
	/** Height , scrollTop, ClientHeight */
	const [ScrollLocationMap, setScrollLocationMap] = useState(new Map<string, [number, number, number]>())
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
		ws.current.onmessage = (async (event) => {
			// const JsonMessage = JSON.parse(event.data) as IBotMessage
			const arrayBuffer = await (event.data as Blob).arrayBuffer()
			const BUffer = new Uint8Array(arrayBuffer)
			const BotResponse = DiscordBotJS.BotResponse.decode(BUffer);
			if (BotResponse.botMessage) {
				if (!(Object.keys(BotResponse.botMessage!.attachments!).length > 0)) {
					BotResponse.botMessage!.attachments = null
				} 
				if (!(BotResponse.botMessage!.embeds!.length > 0)) {
					BotResponse.botMessage!.embeds = null
				}
				AddMessage(BotResponse)
			} else if (BotResponse.botEditMessage) {

				EditMessage(BotResponse)
			} else if (BotResponse.botDeleteMessage) {

				DeleteMessage(BotResponse)
			} else {
				console.log('Unhandled message type')
			}
		}); 
	},[ChannelMessages, SelectedID, IsAtTheBottomOfMessages])
	const EditMessage = (payload: DiscordBotJS.BotResponse) => {

		SetChannelMessages((Messages) => (new Map(
			Messages.set(payload.botMessage!.channel_id!, Messages.get(payload.botMessage!.channel_id!)!
			.set(payload.id, {...Messages
				.get(payload.botMessage!.channel_id!)!
				.get(payload.id)!, is_edited: true, content: payload.botEditMessage!.content!} 
			)))
		))
	}
	const DeleteMessage = (payload: DiscordBotJS.BotResponse) => {
		if (ChannelMessages.get(payload.botDeleteMessage!.channel_id!)) {
			const start = performance.now()	
			SetChannelMessages((Messages) => (new Map(
				Messages.set(payload.botDeleteMessage!.channel_id!, Messages.get(payload.botDeleteMessage!.channel_id!)!
				.set(payload.id, {...Messages
					.get(payload.botDeleteMessage!.channel_id!)!
					.get(payload.id)!, is_deleted: true} 
				)))
			))
			console.log("Message DLETE", performance.now() - start)
		} else {
			// Channel was not loaded. Do not add the message
			console.log('CHANNEL NOT LOADED')
		}

	}
	const AddMessage = (payload: DiscordBotJS.BotResponse) => {
		// Check if we have that channel laoded
		if (ChannelMessages.get(payload.botMessage!.channel_id!)) {
			// TODO: proper interface
			// SetChannelMessages((messages) => ({ ...messages, [payload.channel_id]: [...messages[payload.channel_id]!, (payload as any)]}))
			SetChannelMessages((Messages) => (new Map(Messages.set(payload.botMessage!.channel_id!, Messages.get(payload.botMessage!.channel_id!)!
			.set(payload.id, payload.botMessage as any)))))
			console.log(ScrollToRef)
			if (IsAtTheBottomOfMessages.has(SelectedID.id!)) {
				if (IsAtTheBottomOfMessages.get(SelectedID.id!)!) {
					// Automatically scroll
					ScrollToRef.current!.scrollIntoView({behavior: 'smooth'})
				}
			} else {
				// do nothing
			}

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
				fetch(`/api/${guild_id}/users`, {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json'
						// 'Content-Type': 'application/x-www-form-urlencoded',
					},
				})
				.then(res => res.json())
				.then((result: GuildUsers[]) => {
					const a = new Map<string,GuildUsers>()
					result.forEach((value, key) => {
						a.set(value.id, value)
					})
					SetGuildUsersMap(a);
				})
			})
	}, [])

	useEffect(() => {
		console.log('useeffecy')
		if (ScrollLocationMap.has(SelectedID.id!)) {
			if (IsAtTheBottomOfMessages.has(SelectedID.id!)) {
				if (IsAtTheBottomOfMessages.get(SelectedID.id!)) {
					ScrollRef.current!.scrollTop = ScrollLocationMap.get(SelectedID.id!)![1] + 99999
				} else {
					ScrollRef.current!.scrollTop = ScrollLocationMap.get(SelectedID.id!)![1]
				}
			} else {
				ScrollRef.current!.scrollTop = ScrollLocationMap.get(SelectedID.id!)![1]
			}
		}
	}, [SelectedID])

	if (channelsID) {
		return (
			<div className="flex contain-to-screen-size">
				{/* Channel List */}
				<div className="flex-none w-56">
					<ChannelList selectedChannel={SelectedID} setSelectedChannel={setSelectedID} Channels={channelsID} />
				</div>
				{/* Selected Channel */}
				<div className="flex flex-1 flex-col break-words overflow-auto">
					<div ref={ScrollRef} className="flex flex-col overflow-auto" id="scroll-chat" onScroll={() => {		
						console.log('scrolls')				
						setScrollLocationMap((ScrollLocationMap) => (new Map(ScrollLocationMap.set(SelectedID.id!, [
							ScrollRef.current!.scrollHeight,
							ScrollRef.current!.scrollTop,
							ScrollRef.current!.clientHeight
						]
						))))
						if (ScrollRef.current!.scrollHeight === ScrollRef.current!.scrollTop + ScrollRef.current!.clientHeight) {
							// We are the very bottom of the scrollable div
							SetIsAtTheBottomOfMessages(map => (map.set(SelectedID.id!, true)));
						} else {
							// Anywhere else
							SetIsAtTheBottomOfMessages(map => (map.set(SelectedID.id!, false)));
						}
					}}>
						<TextChannelSelected ScrollRef={ScrollToRef} selectedChannel={SelectedID} ChannelMessages={ChannelMessages} SetChannelMessages={SetChannelMessages} />
						<div ref={ScrollToRef} id="empty"></div>
					</div>
					<div className="flex h-10 bg-gray-500">
						<div>Is typing will go here??</div>
					</div>
				</div>
				{/* TEMP? */}
				<MemberStatus />
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
	SelectedTextChannel: Map<string, ChannelMessage>,
	SelectedChannel: string}
	) 
{
	const start = performance.now()
	let a: JSX.Element[] = []
	props.SelectedTextChannel.forEach((element, key) => {
		if (element.attachments) {
			a.push(<div className="py-1" key={key}>Is an attachment =&gt; Name: {element.nickname ? element.nickname : element.username} =&gt; {element.attachments}</div>)
		} else if (element.embeds) {
			a.push(<div className="py-1" key={key}>Is an embed =&gt; Name: {element.nickname ? element.nickname : element.username} =&gt;  {element.embeds}  {element.is_deleted ? "IS DELETD" : ""}</div>)
		} else {
			if (element.is_deleted) {
				a.push(<div className="py-1" key={key}>{element.nickname ? element.nickname : element.username} =&gt; {element.content} IS DELETED</div>)	
			} else if (element.is_edited) {
				a.push(<div className="py-1" key={key}>{element.nickname ? element.nickname : element.username} =&gt; {element.content} IS EDITED</div>)	
			} else if (element.is_pinned) {
				a.push(<div className="py-1" key={key}>{element.nickname ? element.nickname : element.username} =&gt; {element.content} IS PINNED</div>)	
			} else {
				// normal message
				a.push(<div className="py-1" key={key}>{element.nickname ? element.nickname : element.username} =&gt; {element.content}</div>)	
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
		ScrollRef: React.MutableRefObject<HTMLDivElement | null>
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
				}).then(() => {
					props.ScrollRef.current!.scrollIntoView()
				})
		}


	}, [props.selectedChannel])

	// TODO: Improve logic
	if (props.ChannelMessages.get(props.selectedChannel.id!) && props.selectedChannel.id) {
		return (
			<>
				<div className="flex flex-col">
					<TextLikeChannel SelectedChannel={props.selectedChannel.id} SelectedTextChannel={props.ChannelMessages.get(props.selectedChannel.id!)!}/>
				</div>
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
	nickname: string | null,
	username: string
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
// TODO: SHARE WITH SERVER
interface GuildUsers {
	nickname: string,
	display_hex_color: string,
	id: string,
	username: string,
	discriminator: number,
	avatar: string
	bot: boolean,
	permissions: number
}

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

