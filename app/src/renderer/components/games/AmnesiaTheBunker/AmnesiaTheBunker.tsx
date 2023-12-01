import React, { ChangeEvent, useEffect, useState } from 'react'
import { Col, Container, FormCheck, FormLabel, FormSelect, Row } from 'react-bootstrap'
import AmnesiaTheBunketStateDTO from '../../../../shared/AmnesiaTheBunkerStateDTO';
import { usePainBox } from '../../../context/PainBoxContext';
import { Events } from '../../../../shared/Events';
import SharedUtils from '../../../../shared/SharedUtils';

export default function AmnesiaTheBunker() {
	const painBox = usePainBox();

	const [state, setState] = useState<AmnesiaTheBunketStateDTO>(painBox.amnesiaTheBunkerState);

	useEffect(() => {
		const onUpdate = (data: AmnesiaTheBunketStateDTO) => {
			setState(data);
		}

		painBox.events.on(Events.AMNESIA_THE_BUNKER_CHANGE, onUpdate);

		return () => {
			painBox.events.off(Events.AMNESIA_THE_BUNKER_CHANGE, onUpdate);
		}
	}, []);

	function handleEnableChanged(e: ChangeEvent<any>) {
		painBox.setAmnesiaTheBunkerSettings({
			enabled: e.target.checked,
			save: state.active_save,
			slot: state.active_slot
		});
	}

	function handleProfileChange(e: ChangeEvent<any>) {
		painBox.setAmnesiaTheBunkerSettings({
			enabled: state.enabled,
			save: e.target.value,
			slot: state.active_slot
		});
	}

	function handleSlotChange(e: ChangeEvent<any>) {
		painBox.setAmnesiaTheBunkerSettings({
			enabled: state.enabled,
			save: state.active_save,
			slot: e.target.value
		});
	}

	return (
		<>
			<Container>
				<Row>
					<Col>
						<h4>Amnesia: The Bunker</h4>
					</Col>
				</Row>

				<Row>
					<Col>
						<FormCheck type="switch" label="Enable" checked={state.enabled} onChange={handleEnableChanged} />
					</Col>
				</Row>

				<Row>
					<Col xs={12} sm={12} md={6}>
						<FormLabel>Select profile</FormLabel>
						<FormSelect value={state.active_save} onChange={handleProfileChange}>
							<option value="" disabled>Select profile</option>
							{state.saves.map(s => <option value={s} key={s}>{SharedUtils.getFileName(s)}</option>)}
						</FormSelect>
					</Col>
					<Col xs={12} sm={12} md={6}>
						<FormLabel>Select slot</FormLabel>
						<FormSelect value={state.active_slot} onChange={handleSlotChange}>
							<option value="" disabled>Select slot</option>
							{state.slots.map(s => <option value={s} key={s}>{s}</option>)}
						</FormSelect>
					</Col>
				</Row>

				<Row>
					<Col>
						<p>
							Profile: {SharedUtils.getFileName(state.active_save)}<br />
							Slot: {state.active_slot}<br />
						</p>

						<p>
							{state.data == null ?
								<>
									{state.enabled ? "No save data available. Check settings" : "Not enabled"}
								</>
								:
								<>
									Time played: {state.data.TimePlayed}<br />
									Times saved: {state.data.TimesSaved}<br />
									Blackouts: {state.data.Blackouts}<br />
									Times spotted by stalker: {state.data.TimesSpottedByStalker}<br />
									Traps triggered: {state.data.TrapsTriggered}<br />
									Deaths: {state.data.NumberOfDeaths}<br />
								</>
							}
						</p>
					</Col>
				</Row>
			</Container >
		</>
	)
}
