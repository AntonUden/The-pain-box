export default class SharedUtils {
	static getFileName(path: string) {
		const normalizedPath = path.replace(/\\/g, '/');
		return normalizedPath.split('/').pop();
	}
}