import React, { useEffect } from 'react'

import { usePainBox } from './context/PainBoxContext';
import ConnectionManager from './components/ConnectionManager';
import { Col, Container, Row } from 'react-bootstrap';
import ShockButton from './components/buttons/ShockButton';
import AmnesiaTheBunker from './components/games/AmnesiaTheBunker/AmnesiaTheBunker';

export default function App() {
	const painBox = usePainBox();
	useEffect(() => {
		console.log("painBox.init()");
		painBox.init();
	}, []);

	return (
		<>
			<Container className='mt-2'>
				<ConnectionManager />

				<Row className='mt-4'>
					<Col>
						<ShockButton />
					</Col>
				</Row>

				<Row className='mt-4'>
					<Col className='col-12'>
						<h1>Games</h1>
					</Col>
				</Row>

				<Row>
					<Col className='col-12'>
						<AmnesiaTheBunker />
					</Col>
				</Row>
			</Container>
		</>
	);
}
