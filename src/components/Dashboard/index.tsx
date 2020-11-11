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
	let { id } = useParams<{ id: string }>()
	let history = useHistory();
	function GoToLogs() {
		console.log(history)
		history.push(`${history.location.pathname}/logs`)
	}

	console.log(id)
	return (
		<div>
			<div onClick={GoToLogs}>Chat Logs</div>
		</div>
	)
}