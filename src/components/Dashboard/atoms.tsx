import {
	RecoilRoot,
	atom,
	selector,
	useRecoilState,
	useRecoilValue,
} from 'recoil';
import { ChannelMessage } from './GuildLogs';

//														 channel_id   message_id  message
//let [ChannelMessages, SetChannelMessages] = useState<Map<string, Map<string,ChannelMessage> | null>>(new Map());
export const channelMessagesAtom = atom<any[]>({
	key: 'channelMessagesAtom',
	default: []
})

export const ScrollLocationMapAtom = atom({
	key: 'ScrollLocationMapAtom',
	default: new Map<string, [number, number, number]>()
})

export const SelectedIdAtom = atom<{ id: string | null, type: 'text' | 'voice' | 'category' | 'dm' | 'store' | 'news' | null } >({
	key: 'SelectedId',
	default: ({ id: window.localStorage.getItem("SelectedChannelId") ? window.localStorage.getItem("SelectedChannelId") : null,	type: window.localStorage.getItem("SelectedChannelType") as any ? window.localStorage.getItem("SelectedChannelType") as any : null})
})

export const IsAtTheBottomOfMessagesMapAtom = atom<Map<string, boolean>>({
	key: 'IsAtTheBottomOfMessages',
	default: new Map()
})