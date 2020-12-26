import { ChannelMessage, ICategoryChannel, INewsChannel, IStoreChannel, ITextChannel, IVoiceChannel, TChannels } from "./GuildLogs";
import React, { useEffect, useRef, useState } from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	useHistory,
	useParams
} from "react-router-dom";
import { useRecoilState, useSetRecoilState } from 'recoil';
import { SelectedIdAtom } from './atoms';

export function CategoryChannel(props: {Channel: ICategoryChannel, isSelected: string | null, HandleClick: (index: string, type: 'text' | 'voice' | 'category' | 'dm' | 'store' | 'news') => void }) {
	return (
		<div className={`${props.isSelected === props.Channel.channel_id ? "bg-red-500" : ""} truncate`} 
			onClick={() => { props.HandleClick(props.Channel.channel_id, props.Channel.types)} }>{props.Channel.name} 
		</div>
	)
}

export function TextChannel(props: {Channel: ITextChannel, isSelected: string | null, HandleClick: (index: string, type: 'text' | 'voice' | 'category' | 'dm' | 'store' | 'news') => void }) {
	return (
		<div className={`${props.isSelected === props.Channel.channel_id ? "bg-red-500" : ""} truncate`} 
			onClick={() => { props.HandleClick(props.Channel.channel_id, props.Channel.types)} }>{props.Channel.name} 
		</div>
	)
}

export function VoiceChannel(props: {Channel: IVoiceChannel, isSelected: string | null, HandleClick: (index: string, type: 'text' | 'voice' | 'category' | 'dm' | 'store' | 'news') => void }) {
	return (
		<div className={`${props.isSelected === props.Channel.channel_id ? "bg-red-500" : ""} truncate`} 
			onClick={() => { props.HandleClick(props.Channel.channel_id, props.Channel.types)} }>{props.Channel.name} 
		</div>
	)
}

export function StoreChannel(props: {Channel: IStoreChannel, isSelected: string | null, HandleClick: (index: string, type: 'text' | 'voice' | 'category' | 'dm' | 'store' | 'news') => void }) {
	return (
		<div className={`${props.isSelected === props.Channel.channel_id ? "bg-red-500" : ""} truncate`} 
			onClick={() => { props.HandleClick(props.Channel.channel_id, props.Channel.types)} }>{props.Channel.name} 
		</div>
	)
}

export function NewsChannel(props: {Channel: INewsChannel, isSelected: string | null, HandleClick: (index: string, type: 'text' | 'voice' | 'category' | 'dm' | 'store' | 'news') => void }) {
	return (
		<div className={`${props.isSelected === props.Channel.channel_id ? "bg-red-500" : ""} truncate`} 
			onClick={() => { props.HandleClick(props.Channel.channel_id, props.Channel.types)} }>{props.Channel.name} 
		</div>
	)
}

export function ChannelList(props: { Channels: TChannels[]}) {
	let Channels: JSX.Element[] = []
	const ChannelMaps = new Map<string, TChannels>()
	const sorted = props.Channels.sort((a, b) => a.position - b.position)
	const [SelectedID, setSelectedID] = useRecoilState(SelectedIdAtom)

	sorted.forEach((element) => {
		ChannelMaps.set(element.channel_id, element);
	})

	const CategoryChannels = new Map<string, TChannels[]>()
	// Since the array is sorted by position all channels should be sorted when being inserted

	// Get all the category channels
	for (let index = 0; index < sorted.length; index++) {
		// Category channel OR lone channel(s)
		if (!sorted[index].parent) {
			if (sorted[index].types === "category") {
				if (CategoryChannels.has(sorted[index].channel_id)) {
					// Category channel already set below	
					CategoryChannels.get(sorted[index].channel_id)!.push(sorted[index])
				} else {
					CategoryChannels.set(sorted[index].channel_id, [sorted[index]])
				}
			} else {
				// Lone channel
			}
		}
	}
	// Add all the channels to their respective category
	for (let index = 0; index < sorted.length; index++) {
		// Check if we have the category for that channel
		if (CategoryChannels.has(sorted[index].parent)) {
			// Have just add it
			CategoryChannels.get(sorted[index].parent)!.push(sorted[index])
		}
	}

	const HandleSelect = (index: string, type: 'text' | 'voice' | 'category' | 'dm' | 'store' | 'news') => {
		setSelectedID({id: index, type: type})
		// Set the result in local storage
		window.localStorage.setItem("SelectedChannelId", index);
		window.localStorage.setItem("SelectedChannelType", type);
	}
	
	CategoryChannels.forEach((value, key) => {
		value.forEach((value) => {
			if (value.types === "category") {
				Channels.push(<CategoryChannel isSelected={SelectedID.id!} HandleClick={HandleSelect} key={value.channel_id} Channel={value} />)
			} else if (value.types === "text") {
				Channels.push(<TextChannel isSelected={SelectedID.id!} HandleClick={HandleSelect} key={value.channel_id} Channel={value} />)
			} else if (value.types === "voice") {
				Channels.push(<VoiceChannel isSelected={SelectedID.id!} HandleClick={HandleSelect} key={value.channel_id} Channel={value} />)
			} else if (value.types === "store") {
				Channels.push(<StoreChannel isSelected={SelectedID.id!} HandleClick={HandleSelect} key={value.channel_id} Channel={value} />)
			} else if (value.types === "news") {
				Channels.push(<NewsChannel isSelected={SelectedID.id!} HandleClick={HandleSelect} key={value.channel_id} Channel={value} />)
			}
			// Channels.push(<IndividualChannel isSelected={SelectedID} HandleClick={HandleSelect} key={value.channel_id} Channel={value} />)
		})
	})

	return (
		<>
			<div className="select-none w-full" /**onClick={(e) => {console.log(e.target)}}*/>
				{Channels}
			</div>
		</>
	)
}