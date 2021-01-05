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
import { TextChannelSelected } from './ChannelText';
import {
	RecoilRoot,
	atom,
	selector,
	useRecoilState,
	useRecoilValue,
	useSetRecoilState,
} from 'recoil';
import { channelMessagesAtom } from './atoms';
export function GuildLogs() {
	const [channelsID, setChannelsID] = useState<TChannels[] | null>(null);
	const { guild_id } = useParams<{ guild_id: string }>()

	// Some state to save the messages of all channels after they have been loaded.
	//														 channel_id   message_id  message
	let [ChannelMessages, SetChannelMessages] = useState<Map<string, Map<string,ChannelMessage> | null>>(new Map());
	const ws = useRef<WebSocket | null>(null);
	const [GuildUsersMap, SetGuildUsersMap] = useState<Map<string,GuildUsers> | null>(new Map());
	/** We will scroll to this Div */

	useEffect(() => {
		let KeepAlive: NodeJS.Timeout
		function connect() {
			ws.current = new WebSocket("wss://patrykstyla.com:9001")
			ws.current.binaryType = "arraybuffer"
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

			ws.current.onmessage = (async (event) => {
				// const JsonMessage = JSON.parse(event.data) as IBotMessage
				const BUffer = new Uint8Array(event.data as ArrayBuffer)
				const BotResponse = DiscordBotJS.BotResponse.decode(BUffer);
				if (BotResponse.botMessage) {
					if (!(Object.keys(BotResponse.botMessage!.attachments!).length > 0)) {
						BotResponse.botMessage!.attachments = null
					} 
					if (!(BotResponse.botMessage!.embeds!.length > 0)) {
						BotResponse.botMessage!.embeds = null
					}
					a(a => [...a, BotResponse.guild_id])
					AddMessage(BotResponse)
				} else if (BotResponse.botEditMessage) {
	
					EditMessage(BotResponse)
				} else if (BotResponse.botDeleteMessage) {
	
					DeleteMessage(BotResponse)
				} else {
					console.log('Unhandled message type')
				}
			});
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

		document.addEventListener("contextmenu", handleContextMemu)
		document.addEventListener('click', handleClick);
		
		function handleContextMemu(event: MouseEvent) {
			console.log(event)
			event.preventDefault()
		}

		function handleClick(event: MouseEvent) {
			console.log(event)
			event.preventDefault()
		}

		return function cleanup() {
			// destroy ws
			// WebSocket.close() waits to close the connection while the cleanup runs instantly
			// this causes the event listeners to stay and try to reconnect to the socket
			ws.current!.onclose = () => {};
			ws.current!.close(1000)
			// Clean interval
			clearInterval(KeepAlive);
			document.removeEventListener('contextmenu', handleContextMemu);
			document.removeEventListener('click', handleClick);
		}
	}, [])
	const a = useSetRecoilState(channelMessagesAtom)
	// 
	useEffect(() => {

		if (!ws.current){
			return;
		}
 
	},[])
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
		SetChannelMessages((Messages) => (Messages.get(payload.botMessage!.channel_id!)! ?
			new Map(Messages.set(payload.botMessage!.channel_id!, 
				Messages.get(payload.botMessage!.channel_id!)!
				.set(payload.id, payload.botMessage as any))) : Messages
		))
		// if (ChannelMessages.get(payload.botMessage!.channel_id!)) {
		// 	// TODO: proper interface
		// 	// SetChannelMessages((messages) => ({ ...messages, [payload.channel_id]: [...messages[payload.channel_id]!, (payload as any)]}))
		// 	SetChannelMessages((Messages) => (new Map(Messages.set(payload.botMessage!.channel_id!, Messages.get(payload.botMessage!.channel_id!)!
		// 	.set(payload.id, payload.botMessage as any)))))
		// 	console.log(ScrollToRef)
		// 	if (IsAtTheBottomOfMessages.has(SelectedID.id!)) {
		// 		if (IsAtTheBottomOfMessages.get(SelectedID.id!)!) {
		// 			// Automatically scroll
		// 			ScrollToRef.current!.scrollIntoView({behavior: 'smooth'})
		// 		}
		// 	} else {
		// 		// do nothing
		// 	}

		// } else {
		// 	// Channel was not loaded. Do not add the message
		// 	console.log('CHANNEL NOT LOADED')
		// }
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

	// useEffect(() => {
	// 	console.log('useeffecy')
	// 	if (ScrollLocationMap.has(SelectedID.id!)) {
	// 		if (IsAtTheBottomOfMessages.has(SelectedID.id!)) {
	// 			if (IsAtTheBottomOfMessages.get(SelectedID.id!)) {
	// 				ScrollRef.current!.scrollTop = ScrollLocationMap.get(SelectedID.id!)![1] + 99999
	// 			} else {
	// 				ScrollRef.current!.scrollTop = ScrollLocationMap.get(SelectedID.id!)![1]
	// 			}
	// 		} else {
	// 			ScrollRef.current!.scrollTop = ScrollLocationMap.get(SelectedID.id!)![1]
	// 		}
	// 	}
	// }, [SelectedID])

	if (channelsID) {
		return (
			<div className="flex contain-to-screen-size">
				{/* Channel List */}
				<div className="flex-none w-56">
					<ChannelList Channels={channelsID} />
				</div>
				{/* Selected Channel */}
				<TextChannelSelected ChannelMessages={ChannelMessages} SetChannelMessages={SetChannelMessages} />
				{/* TEMP? */}
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

export function MemberStatus() {
	return (
		<div className="flex flex-grow-0 flex-shrink-0 w-44">member status here????</div>
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

