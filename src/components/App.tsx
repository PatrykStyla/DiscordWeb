import { hot } from 'react-hot-loader';
import React, { useEffect, useRef, useState } from 'react';

import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	useHistory,
	useParams
} from "react-router-dom";
import { NavBar } from './NavBar/NavBar';
import { Dashboard } from './Dashboard';
import { GuildLogs } from './Dashboard/GuildLogs';

// https://discord.com/api/oauth2/authorize?client_id=719720108808994917&redirect_uri=https%3A%2F%2Fdiscord.patrykstyla.com%2Fapi%2Fdiscord-login&response_type=code&scope=email%20identify%20guilds

// return (
// 	<div>
// 		<button onClick={this.HandleLogin}>LOG IN</button>
// 	</div>
// );

function GuildElement(props: {guild_id: string}) {
	let history = useHistory()

	function HandleGuildClick(ev: React.MouseEvent<HTMLDivElement, MouseEvent>, guild_id: string) {
		history.push({
			pathname: `/server/${guild_id}`
		})
	}

	return (
		<div key={props.guild_id} onClick={(e) => {HandleGuildClick(e, props.guild_id)}}>{props.guild_id}</div>
	)
}

function App() {
	const [user, setUser] = useState<{guild_id: string, permissions: number, icon: number, name: string}[] | null>(null)	
	const [a, setA] = useState<string | null>(null)
	const [isLoggedIn, setIsLoggedIn] = useState(false)

	useEffect(() => {
		fetch('/api/users/@me')
			.then(res => res.json())
			.then((result) => {
				setUser(result)
				setIsLoggedIn(true);
			},
			(error) => {
				console.log(error)
			})
	},[])

	if (isLoggedIn && user) {	
		let Guilds: JSX.Element[] = []
		user.forEach((element,key) => {
			Guilds.push(<GuildElement key={element.guild_id} guild_id={element.guild_id}/>)
		})
		return (
		<>
			<NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />

			<Switch>
				<Route exact path="/">
					{Guilds}
					<div className=""></div>
				</Route>
				<Route exact path="/server/:guild_id">
					{/* User selected a guild. Show a dashboard */}
					<Dashboard/>
				</Route>
				<Route exact path="/server/:guild_id/logs">
					<GuildLogs />
				</Route>
				<Route path="/server">

				</Route>

			</Switch>
		</>	
		)
	} else {
		return (<NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}></NavBar>)
	}

}
export default hot(module)(App); 
