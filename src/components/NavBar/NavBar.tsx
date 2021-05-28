import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

let a: Window
let accessCode: string | string[]

window.addEventListener("message", (e) => {
	if (e.origin !== "https://discord.patrykstyla.com") {
		return;
	}
	// ignore messages that are not from the pop up
	if (!a) {
		return
	}

	// Discord call sucesfull
	if (e.data.success === 1) {
		console.log('Succ')
		const url = new URL(a.window.location.href);
		const codeParam = url.searchParams.get("code")

		if (codeParam) {
			// We got the code
			accessCode = codeParam;
		}
		a.close()
		console.log(accessCode)
	} else {
	}
})

function HandleLogin() {
	a = window.open('https://discord.com/api/oauth2/authorize?client_id=719720108808994917&redirect_uri=https%3A%2F%2Fdiscord.patrykstyla.com%2Fapi%2Fdiscord-login&response_type=code&scope=email%20identify%20guilds', 'popup', 'width=500,height=800')!;
}

function MobileDropdown(props: { isHiddenMobile: boolean }) {
	return (
		<div hidden={props.isHiddenMobile} className={`sm:hidden`}>
			<div className="px-2 pt-2 pb-3">
				<a href="#" className={`block px-3 py-2      rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out`}>Dashboard</a>
				<a href="#" className={`mt-1 block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out`}>Team</a>
				<a href="#" className={`mt-1 block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out`}>Projects</a>
				<a href="#" className={`mt-1 block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out`}>Calendar</a>
			</div>
		</div>
	)
}

function NavBarLinkElements(props: any) {
	return (
		<div className="hidden sm:block w-full">
			<div className="flex flex-1 w-full">
				<Link to="/" className={`px-3 py-2 rounded-md text-lg font-medium leading-5 text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out`}>Home</Link>
				<Link to="/servers" className={`px-3 py-2 rounded-md text-lg font-medium leading-5 text-gray-300 hover:text-white hover:bg-gray-700 focus:outline-none focus:text-white focus:bg-gray-700 transition duration-150 ease-in-out`}>Servers</Link>
				<button className="ml-auto mr-10" onClick={HandleLogin}>LOG IN</button>
			</div>
		</div>
	)
}

function MobileMenuDropdown(props: { MobileMenu: boolean, isHiddenMobile: boolean, setMobileMenu: React.Dispatch<React.SetStateAction<boolean>>, setIsHiddenMobile: React.Dispatch<React.SetStateAction<boolean>> }) {
	return (
		<button onClick={() => { props.setIsHiddenMobile(!props.isHiddenMobile); props.setMobileMenu(!props.MobileMenu) }} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 focus:text-white transition duration-150 ease-in-out" aria-label="Main menu" aria-expanded="false">
			<svg className={`${props.MobileMenu ? "block" : "hidden"} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
			<svg className={`${!props.MobileMenu ? "block" : "hidden"} h-6 w-6`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
			</svg>
		</button>
	)
}

export function NavBar(props: any) {
	const [isHiddenMobile, setIsHiddenMobile] = useState(true)
	const [MobileMenu, setMobileMenu] = useState(true)

	return (
		<nav className="bg-gray-800">
			<div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
				<div className="relative flex items-center justify-between h-16">
					<div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
						<MobileMenuDropdown MobileMenu={MobileMenu} isHiddenMobile={isHiddenMobile} setIsHiddenMobile={setIsHiddenMobile} setMobileMenu={setMobileMenu} />
					</div>
					<div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
						<NavBarLinkElements />
					</div>
					{/* Profile Tab */}
					{/* <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
						<div className="ml-3 relative">
							<button onBlur={() => { setIsHidden(true) }} onClick={() => { setIsHidden(!isHidden) }} className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-white transition duration-150 ease-in-out" id="user-menu" aria-label="User menu" aria-haspopup="true">
								<img className="h-8 w-8 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""></img>
							</button>
							<div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg" hidden={isHidden}>
								<div className="py-1 rounded-md bg-white shadow-xs" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
									<a href="#" className="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" role="menuitem">Your Profile</a>
									<a href="#" className="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" role="menuitem">Settings</a>
									<a href="#" className="block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition duration-150 ease-in-out" role="menuitem">Sign out</a>
								</div>
							</div>
						</div>
					</div> */}
					{/* Profile Tab */}
				</div>
			</div>
			<MobileDropdown isHiddenMobile={isHiddenMobile} />
		</nav>
	)
}
