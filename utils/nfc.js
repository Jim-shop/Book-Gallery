import {
	arrayBufferToHex
} from "utils.js"

function genReadBlockInstruction(uid, firstBlock, numBlock) {
	let byteview = new Uint8Array(12);
	byteview[0] = 0x22; // flag
	byteview[1] = 0x23; // 命令：读多个块
	byteview.set(new Uint8Array(uid), 2); // UID
	byteview[10] = firstBlock; // 首块序号
	byteview[11] = numBlock - 1; // 块数量 - 1
	return byteview.buffer;
}

function parseBookId(rawNfc) {
	let raw = new Uint8Array(rawNfc.slice(1)); // 去除读取正确的指示
	let bookid_arr = [raw[1], raw[0], raw[7], raw[6], raw[5], raw[4]]; // 重排
	let bookid_hex = arrayBufferToHex(bookid_arr);
	let bookid = parseInt(bookid_hex, 16);
	let bookid_str = `F${bookid}`;
	return bookid_str;
}

export default class NfcReader {
	constructor(handler) {
		let nfc = wx.getNFCAdapter()
		nfc.onDiscovered(res => {
			let uid = res.id;
			let nfcv = nfc.getNfcV(); // 芯片SL2S2002
			nfcv.connect({
				success(res) {
					nfcv.transceive({
						data: genReadBlockInstruction(uid, 0x00, 0x02),
						success(res) {
							handler(parseBookId(res.data))
						}
					})
				}
			})
		})
		nfc.startDiscovery()
	}
}

export {
	NfcReader
};