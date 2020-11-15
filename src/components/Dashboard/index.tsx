import React, { useEffect, useRef, useState } from 'react';
import url from 'url';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
	useHistory,
	useParams
} from "react-router-dom";

export function Dashboard() {
	let { guild_id } = useParams<{ guild_id: string }>()
	let history = useHistory();
	function GoToLogs() {
		console.log(history)
		history.push(`${history.location.pathname}/logs`)
	}
	return (
		<div>
			<div onClick={GoToLogs}>Chat Logs</div>
		</div>
	)
}