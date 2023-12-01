import React from 'react'
import { Button } from 'react-bootstrap'
import { usePainBox } from '../../context/PainBoxContext'

export default function ShockButton() {
	const painBox = usePainBox();

	function shock() {
		painBox.shock();
	}

	return (
		<Button variant='danger' onClick={shock}>Shock me</Button>
	)
}
