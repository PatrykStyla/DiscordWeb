import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, } from 'react-router-dom';
import App from './components/App';
import {
	RecoilRoot,
	atom,
	selector,
	useRecoilState,
	useRecoilValue,
} from 'recoil';

ReactDOM.render(
	<Router>
		<RecoilRoot>
			<App />
		</RecoilRoot>
	</Router>
	, document.getElementById('root'));