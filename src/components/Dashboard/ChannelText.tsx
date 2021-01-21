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
import { ChannelMessage, MemberStatus } from './GuildLogs';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { channelMessagesAtom, IsAtTheBottomOfMessagesMapAtom, ScrollLocationMapAtom, SelectedIdAtom } from './atoms';

export function TextChannelSelected(props: {
	ChannelMessages: Map<string, Map<string, ChannelMessage> | null>,
	SetChannelMessages: React.Dispatch<React.SetStateAction<Map<string, Map<string, ChannelMessage> | null>>>
}) {
	const ScrollRef = useRef<HTMLDivElement | null>(null)
	const ScrollToRef = useRef<HTMLDivElement | null>(null)
	// Write
	const ScrollLocationMap = useSetRecoilState(ScrollLocationMapAtom)
	// Read
	const SelectedID = useRecoilValue(SelectedIdAtom)
	// Read AND Write
	const [IsAtTheBottomOfMessagesMap, SetIsAtTheBottomOfMessagesMap] = useRecoilState(IsAtTheBottomOfMessagesMapAtom)

	// Get the channel messages when this channel is selected
	useEffect(() => {
		// On load fetch only if we have a channel selected
		// TODO: Once a channel is loaded add it to state AND don't load it anymore
		// TODO: Add messages from the websocket
		if (SelectedID.id) {
			// Don't fetch anything if state is not set
			// OR the selected channel is not a text channel
			if (!SelectedID || SelectedID.type === "category" || SelectedID.type === "voice") {
				console.log('nope')
				return;
			}
			// We have that channel don't fetch it
			if (props.ChannelMessages.has(SelectedID.id)) {
				return;
			}
			fetch(`/api/channels/${SelectedID.id}/messages`, {
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
					props.SetChannelMessages((messages) => (new Map(messages.set(SelectedID.id!, a as any))))
					// props.ChannelRefMap.
				} else {
					props.SetChannelMessages((messages) => (new Map(messages.set(SelectedID.id!, null))))
				}
			})
		}
	}, [SelectedID])

	useEffect(() => {
		if (!IsAtTheBottomOfMessagesMap.has(SelectedID.id!)) {
			if (ScrollToRef.current) {
				ScrollToRef.current.scrollIntoView()
			}
		} else if (IsAtTheBottomOfMessagesMap.get(SelectedID.id!)) {
			if (ScrollToRef.current) {
				ScrollToRef.current.scrollIntoView({behavior: 'smooth'})
			}
		}

	}, [props.ChannelMessages])
	useEffect(() => {
		if (IsAtTheBottomOfMessagesMap.get(SelectedID.id!)) {
			ScrollToRef.current!.scrollIntoView()
		}
	},[IsAtTheBottomOfMessagesMap, SelectedID])

	// TODO: Improve logic
	if (props.ChannelMessages.get(SelectedID.id!) && SelectedID.id) {
		return (
			<div className="flex flex-col min-w-0 flex-1">
				<div className="flex flex-row h-full" id="scroll-chat" onScroll={() => {
					ScrollLocationMap((ScrollLocationMap) => (new Map(ScrollLocationMap.set(SelectedID.id!, [
						ScrollRef.current!.scrollHeight,
						ScrollRef.current!.scrollTop,
						ScrollRef.current!.clientHeight
					]
					))))
					if (ScrollRef.current!.scrollHeight === ScrollRef.current!.scrollTop + ScrollRef.current!.clientHeight) {
						console.log(IsAtTheBottomOfMessagesMap)
						// We are the very bottom of the scrollable div
						SetIsAtTheBottomOfMessagesMap(map => (new Map([...map,...map.set(SelectedID.id!, true)])));
					} else {
						// Anywhere else
						SetIsAtTheBottomOfMessagesMap(map => (new Map([...map,...map.set(SelectedID.id!, false)])));
					}
				}}>
					<div className="flex flex-col h-full min-w-0 w-full" id="Shrink">
						<div ref={ScrollRef} className="overflow-auto" id="MessageWrapper">
							<div  className="flex flex-col">
								<TextLikeChannel ScrollToRef={ScrollToRef} SelectedChannel={SelectedID.id} SelectedTextChannel={props.ChannelMessages.get(SelectedID.id!)!} />
							</div>
						</div>	
						<div ref={ScrollToRef} id="empty"></div>
						<div className="flex h-10 bg-gray-500">
							<div className="truncate">Is typing will go here??</div>
						</div>
					</div>
					<MemberStatus />
				</div>

			</div>
		)
	}
	return (
		<div className="flex-1">Select a Channel or no messages</div>
	)
}

function TextLikeChannel(props: {
	SelectedTextChannel: Map<string, ChannelMessage>,
	SelectedChannel: string,
	ScrollToRef: React.MutableRefObject<HTMLDivElement | null>
}
) {
	// const ScrollRef = useRef<HTMLDivElement | null>(null)
	// // Write
	// const ScrollLocationMap = useSetRecoilState(ScrollLocationMapAtom)
	// const IsAtTheBottomOfMessagesMap = useSetRecoilState(IsAtTheBottomOfMessagesMapAtom)
	// // Read
	// const SelectedID = useRecoilValue(SelectedIdAtom)

	useEffect(() => {
		console.log(props.ScrollToRef.current!.scrollIntoView())
	}, [])

	const start = performance.now()
	let a: JSX.Element[] = []
	props.SelectedTextChannel.forEach((element, key) => {
		if (element.attachments) {
			// TODO: Type missmatch
			if(typeof element.attachments === "string") {
				a.push(<div className="py-1" key={key}>Is an attachment =&gt; Name: {element.nickname ? element.nickname : element.username} =&gt; {element.attachments}</div>)
			} else if (typeof element.attachments === "object") {
				const av = Object.keys(element.attachments as Object)
				a.push(<div className="py-1" key={key}>Is an attachment =&gt; Name: {element.nickname ? element.nickname : element.username} =&gt; {(element.attachments[av[0]] as any).id}</div>)
			}
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

const sleep = (delay: any) => new Promise((resolve) => setTimeout(resolve, delay))
