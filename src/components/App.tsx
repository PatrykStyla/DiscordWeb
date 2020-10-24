import { hot } from 'react-hot-loader';
import React, { useEffect, useRef, useState } from 'react';
import url from 'url';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link
} from "react-router-dom";
import { Transition } from '@headlessui/react'

// import DB from '/home/tulipan/DiscordBotJS/src/DB/DB'

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
const handleHideElementLooseFocus = (isHiddenState: boolean, setState: React.Dispatch<React.SetStateAction<boolean>>) => {
	setState(true)
}
function App() {
	const [isHidden, setIsHidden] = useState(true)
	const [isHiddenMobile, setIsHiddenMobile] = useState(true)
	const [MobileMenu, setMobileMenu] = useState(true)
	return (
		<Router>
			<nav className="bg-gray-800">
				<div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
					<div className="relative flex items-center justify-between h-16">
						<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
							{/* Mobile menu button */}
							<button onClick={() => {setIsHiddenMobile(!isHiddenMobile); setMobileMenu(!MobileMenu)}} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white transition duration-150 ease-in-out" aria-label="Main menu" aria-expanded="false">
								{/* Three lines menu mobile */}
								<svg className={`${MobileMenu ? "block" : "hidden"} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
								</svg>
								{/* X menu mobile */}
								<svg className={`${!MobileMenu ? "block" : "hidden"} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
								</svg>
							</button>
						</div>
						<div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
							<div className="flex-shrink-0">
								<img className="block lg:hidden h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-mark-on-dark.svg" alt="Workflow logo"></img>
								<img className="hidden lg:block h-8 w-auto" src="https://tailwindui.com/img/logos/workflow-logo-on-dark.svg" alt="Workflow logo"></img>
							</div>
							<div className="hidden sm:block sm:ml-6">
								<div className="flex">
									<a href="#" className="px-3 py-2 rounded-md text-sm font-medium leading-5 text-white bg-gray-900 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out">Dashboard</a>
									<a href="#" className="ml-4 px-3 py-2 rounded-md text-sm font-medium leading-5 text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out">Team</a>
									<a href="#" className="ml-4 px-3 py-2 rounded-md text-sm font-medium leading-5 text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out">Projects</a>
									<a href="#" className="ml-4 px-3 py-2 rounded-md text-sm font-medium leading-5 text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out">Calendar</a>
								</div>
							</div>
						</div>
						<div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
							<div className="ml-3 relative">
								<button onBlur={() => handleHideElementLooseFocus(isHidden, setIsHidden)} onClick={() => {setIsHidden(!isHidden)}} className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-white transition duration-150 ease-in-out" id="user-menu" aria-label="User menu" aria-haspopup="true">
									<img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""></img>
								</button>
		  						{/* Profile Tab */}
								<div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg" hidden={isHidden}>
									<div className="py-1 rounded-md bg-white shadow-xs" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
										<a href="#" className="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" role="menuitem">Your Profile</a>
										<a href="#" className="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" role="menuitem">Settings</a>
										<a href="#" className="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" role="menuitem">Sign out</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div hidden={isHiddenMobile} className={`sm:hidden`}>
					<div className="px-2 pt-2 pb-3">
						<a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gray-900 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out">Dashboard</a>
						<a href="#" className="mt-1 block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out">Team</a>
						<a href="#" className="mt-1 block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out">Projects</a>
						<a href="#" className="mt-1 block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out">Calendar</a>
					</div>
				</div>
			</nav>
			<div>
				hello
			</div>

			<Menu user={"df"}/>
			<Menu2 user={"df"}/>
			<Menu2 user={"df"}/>
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
		</Router>
	)
}

const Menu = ( user:any ) => {
	const [show, setShow] = useState(false);
	const container = useRef(null);
  
	useEffect(() => {
	  const handleOutsideClick = (event: MouseEvent) => {
		if (!(container.current! as any).contains(event.target)) {
		  if (!show) return;
		  setShow(false);
		}
	  };
  
	  window.addEventListener('click', handleOutsideClick);
	  return () => window.removeEventListener('click', handleOutsideClick);
	}, [show, container]);
  
	useEffect(() => {
	  const handleEscape = (event: KeyboardEvent) => {
		if (!show) return;
  
		if (event.key === 'Escape') {
		  setShow(false);
		}
	  };
  
	  document.addEventListener('keyup', handleEscape);
	  return () => document.removeEventListener('keyup', handleEscape);
	}, [show]);
  
	return (
	  <div ref={container} className="relative">
		<button
		  className="menu focus:outline-none focus:shadow-solid "
		  onClick={() => setShow(!show)}>
		  <img
			className="w-10 h-10 rounded-full"
			src={user.picture}
			alt={user.name}
		  />
		</button>
  
		<Transition
		  show={show}
		  enter="transition ease-out duration-100 transform"
		  enterFrom="opacity-0 scale-95"
		  enterTo="opacity-100 scale-100"
		  leave="transition ease-in duration-75 transform"
		  leaveFrom="opacity-100 scale-100"
		  leaveTo="opacity-0 scale-95"
		>
		  <div className="origin-top-right absolute right-0 w-48 py-2 mt-1 bg-gray-800 rounded shadow-md">
			<Link to="/profile">
			  <a className="block px-4 py-2 hover:bg-green-500 hover:text-green-100">
				Profile
			  </a>
			</Link>
			<Link to="/api/logout">
			  <a className="block px-4 py-2 hover:bg-green-500 hover:text-green-100">
				Logout
			  </a>
			</Link>
		  </div>
		</Transition>
	  </div>
	);
  };

  const Menu2 = ( user:any ) => {
	const [show, setShow] = useState(false);
	const container = useRef(null);
  
	useEffect(() => {
	  const handleOutsideClick = (event: MouseEvent) => {
		if (!(container.current! as any).contains(event.target)) {
		  if (!show) return;
		  setShow(false);
		}
	  };
  
	  window.addEventListener('click', handleOutsideClick);
	  return () => window.removeEventListener('click', handleOutsideClick);
	}, [show, container]);
  
	useEffect(() => {
	  const handleEscape = (event: KeyboardEvent) => {
		if (!show) return;
  
		if (event.key === 'Escape') {
		  setShow(false);
		}
	  };
  
	  document.addEventListener('keyup', handleEscape);
	  return () => document.removeEventListener('keyup', handleEscape);
	}, [show]);
  
	return (
	  <div ref={container} className="relative">
		<button
		  className="menu focus:outline-none focus:shadow-solid "
		  onClick={() => setShow(!show)}
		>
		  <img
			className="w-10 h-10 rounded-full"
			src={user.picture}
			alt={user.name}
		  />
		</button>
  
		<Transition
		  show={show}
		  enter="transition ease-out duration-100 transform"
		  enterFrom="opacity-0 scale-95"
		  enterTo="opacity-100 scale-100"
		  leave="transition ease-in duration-75 transform"
		  leaveFrom="opacity-100 scale-100"
		  leaveTo="opacity-0 scale-95"
		>
		  <div className="origin-top-right absolute right-0 w-48 py-2 mt-1 bg-gray-800 rounded shadow-md">
			<Link to="/profile">
			  <a className="block px-4 py-2 hover:bg-green-500 hover:text-green-100">
				Profile
			  </a>
			</Link>
			<Link to="/api/logout">
			  <a className="block px-4 py-2 hover:bg-green-500 hover:text-green-100">
				Logout
			  </a>
			</Link>
		  </div>
		</Transition>
	  </div>
	);
  };

export default hot(module)(App); 