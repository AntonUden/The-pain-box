import React, { ChangeEvent, useEffect, useState } from 'react'
import { Alert, Button, Col, FormSelect, InputGroup, Row } from 'react-bootstrap'
import DeviceInfo from '../../shared/DeviceInfo';
import { usePainBox } from '../context/PainBoxContext';
import { Events } from '../../shared/Events';
import ConnectionStateDTO from '../../shared/ConnectionStateDTO';

export default function ConnectionManager() {
	const painBox = usePainBox();

	const [devices, setDevices] = useState<DeviceInfo[]>(painBox.devices);
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStateDTO>(painBox.connectionStatus);
	const [selectedComPort, setSelectedComPort] = useState<string>("");

	useEffect(() => {
		const onDevicesChange = (devices: DeviceInfo[]) => {
			if (selectedComPort.trim().length == 0) {
				if (devices.length > 0) {
					setSelectedComPort(devices[0].name);
				}
			}
			setDevices(devices);
		}

		const onConnectionStatusChanged = (state: ConnectionStateDTO) => {
			setConnectionStatus(state);
		}

		painBox.events.on(Events.DEVICE_LIST_UPDATE, onDevicesChange);
		painBox.events.on(Events.CONNECTION_STATE_CHANGE, onConnectionStatusChanged);

		return () => {
			painBox.events.off(Events.DEVICE_LIST_UPDATE, onDevicesChange);
			painBox.events.off(Events.CONNECTION_STATE_CHANGE, onConnectionStatusChanged);
		}
	}, []);

	function handleDeviceChange(e: ChangeEvent<any>) {
		setSelectedComPort(e.target.value);
	}

	function handleConnectButton() {
		painBox.connect(selectedComPort);
	}

	function handleDisconnectButton() {
		painBox.disconnect();
	}

	return (
		<>
			<Row>
				<Col>
					{connectionStatus.connecting ?
						<>
							<Alert variant='info'>Connecting</Alert>
						</>
						:
						<>
							{connectionStatus.error != null ?
								<>
									<Alert variant='warning'>Error: {connectionStatus.error}</Alert>
								</>
								:
								<>
									{connectionStatus.connected ?
										<>
											<Alert variant='success'>Connected</Alert>
										</>
										:
										<>
											<Alert variant='danger'>Disconnected</Alert>
										</>
									}
								</>
							}
						</>
					}

				</Col>
			</Row>

			<Row className='mt-2'>
				<Col>
					<InputGroup>
						<FormSelect value={selectedComPort} onChange={handleDeviceChange} disabled={connectionStatus.connected || connectionStatus.connecting}>
							{devices.map(d =>
								<option value={d.name} key={d.name}>
									{d.name} - {d.description}
								</option>
							)}
						</FormSelect>
						{connectionStatus.connected ?
							<>
								<Button variant='secondary' onClick={handleDisconnectButton}>
									Disconnect
								</Button>
							</>
							:
							<>
								<Button variant='primary' onClick={handleConnectButton} disabled={connectionStatus.connecting}>
									{connectionStatus.connecting ? "Connecting..." : "Connect"}
								</Button>
							</>
						}

					</InputGroup>

				</Col>
			</Row>
		</>

	)
}
