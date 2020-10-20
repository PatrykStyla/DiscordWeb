import { hot } from 'react-hot-loader';
import React from 'react';
import url from 'url';

// import DB from '/home/tulipan/DiscordBotJS/src/DB/DB'

// import '../styles/index.css';

// https://discord.com/api/oauth2/authorize?client_id=719720108808994917&redirect_uri=https%3A%2F%2Fdiscord.patrykstyla.com%2Fapi%2Fdiscord-login&response_type=code&scope=email%20identify%20guilds
let a: Window
let accessCode: string | string[]

window.addEventListener("message", (e) => {
	if (e.origin !== "https://discord.patrykstyla.com") {
		return;
	}
	// Discord call sucesfull
	if (e.data.success === 1) {
		console.log('Succ')	

		const c = url.parse(a.location.href, true)
		if (c.query.code) {
			// We got the code
			accessCode = c.query.code;
		}
		a.close()
		console.log(accessCode)
	} else {
		console.log('Fail')
		// do nothing
	}
})

class App extends React.PureComponent {
	HandleLogin = () => {
		a = window.open('https://discord.com/api/oauth2/authorize?client_id=719720108808994917&redirect_uri=https%3A%2F%2Fdiscord.patrykstyla.com%2Fapi%2Fdiscord-login&response_type=code&scope=email%20identify%20guilds','popup','width=500,height=800')!;
	}

	handleLogin2 = (e: any) => {
		e.PreventDefault()
		window.open('http://www.google.com','popup','width=600,height=600');
	}
	render() {
		return (
			<div>
				<button onClick={this.HandleLogin}>LOGIN</button>
				<a href="http://www.google.com"
					target="popup"
					onClick={this.handleLogin2}>
					Link Text goes here...
					jhgjkhg
				</a>
			</div>
		);
	}
}

export default hot(module)(App);