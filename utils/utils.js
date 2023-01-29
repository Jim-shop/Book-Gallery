function arrayBufferToHex(arr) {
	return Array.prototype.map.call(arr, x => ("00" + x.toString(16)).slice(-2)).join("")
}

export {
	arrayBufferToHex
}
