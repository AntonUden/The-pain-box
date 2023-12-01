import { URL } from 'url';
import path from 'path';
import * as crypto from 'crypto';

export function resolveHtmlPath(htmlFileName: string) {
	if (process.env.NODE_ENV === 'development') {
		const port = process.env.PORT || 1212;
		const url = new URL(`http://localhost:${port}`);
		url.pathname = htmlFileName;
		return url.href;
	}
	return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export function stringToSHA256(input: string): string {
	const hash = crypto.createHash('sha256');
	hash.update(input, 'utf-8');
	return hash.digest('hex');
}

export function arraysHaveSameContent<T>(array1: T[], array2: T[]): boolean {
	if (array1.length !== array2.length) {
		return false;
	}

	const copy1 = [...array1];
	const copy2 = [...array2];

	copy1.sort();
	copy2.sort();

	return JSON.stringify(copy1) === JSON.stringify(copy2);
}
