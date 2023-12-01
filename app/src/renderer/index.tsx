import { createRoot } from 'react-dom/client';
import App from './App';
import { PainBoxContext } from './context/PainBoxContext';
import PainBoxFrontend from './script/PainBoxFrontend';
import { Toaster } from 'react-hot-toast';

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);

const painBox = new PainBoxFrontend();

import './Main.css';

root.render(
	<>
		<PainBoxContext.Provider value={painBox}>
			<App />
			<Toaster />
		</PainBoxContext.Provider>
	</>
);
