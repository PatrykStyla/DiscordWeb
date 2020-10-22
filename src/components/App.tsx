import { hot } from 'react-hot-loader';
import React from 'react';
import url from 'url';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from "react-router-dom";


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
// return (
// 	<div>
// 		<button onClick={this.HandleLogin}>LOG IN</button>
// 	</div>
// );


// HandleLogin = () => {
// 	a = window.open('https://discord.com/api/oauth2/authorize?client_id=719720108808994917&redirect_uri=https%3A%2F%2Fdiscord.patrykstyla.com%2Fapi%2Fdiscord-login&response_type=code&scope=email%20identify%20guilds', 'popup', 'width=500,height=800')!;
// }
function App() {
	return (
		<Router>
			<div>
				<nav>
					<ul>
						<li>
							<Link to="/">Home</Link>
						</li>
						<li>
							<Link to="/about">About</Link>
						</li>
						<li>
							<Link to="/users">Users</Link>
						</li>
					</ul>
				</nav>

				{/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
				<Switch>
					<Route path="/about">
						{/* <About /> */}
					</Route>
					<Route path="/users">
						{/* <Users /> */}
					</Route>
					<Route path="/">
						{/* <Home /> */}
					</Route>
				</Switch>
			</div>
		</Router>
	)
}

export default hot(module)(App); 