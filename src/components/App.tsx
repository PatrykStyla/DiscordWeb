import { hot } from 'react-hot-loader';
import React from 'react';
import Counter from './Counter';

// import '../styles/index.css';


class App extends React.PureComponent {
	render() {
		return (
			<div>
				<h1>Hel dsas lo Worl sdaa sfdd f gfdfg fds fdsdfdsfds sadgfdgfdf  dd!</h1>
				<Counter></Counter>
			</div>
		);
	}
}

export default hot(module)(App);