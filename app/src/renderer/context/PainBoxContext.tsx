import React, { createContext, useContext } from 'react';
import PainBoxFrontend from '../script/PainBoxFrontend';

export const PainBoxContext = createContext<PainBoxFrontend | undefined>(undefined);

export function usePainBox() {
	const context = useContext(PainBoxContext);
	if (!context) {
		throw new Error('usePainBox must be used within a PainBoxProvider');
	}
	return context;
}