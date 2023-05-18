export function getTime() {
	let date = new Date()
	return date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds().toString().padStart(2, "0")
}
