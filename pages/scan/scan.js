import {
    NfcReader
} from "../../utils/nfc.js";

Page({
    data: {
        result: "",
        history: [],
        num: 0,
    },

    onLoad(options) {
        let that = this
        let reader = new NfcReader(that.onValidInput)
        wx.getStorage({
            key: "history",
            success(res) {
                that.setData({
                    history: res.data,
                    num: res.data.length,
                });
            },
            fail() {
                wx.setStorage({
                    key: "history",
                    data: []
                })
            }
        })
    },

    onReady() {},

    onShow() {},

    onHide() {},

    onUnload() {},

    onPullDownRefresh() {},

    onReachBottom() {},

    onShareAppMessage() {},

    onClickScan() {
        let that = this
        wx.scanCode({
            onlyFromCamera: false,
            scanType: ["barCode"],
            success(res) {
                // res.scanType: CODE_128:图书馆条码 EAN_13:ISBN条码
                if (res.scanType == "CODE_128") {
                    that.onValidInput(res.result)
                } else {
                    that.setData({
                        result: `${res.result} from ${res.scanType}`
                    })
                }
            }
        })
    },

    onClickExport() {
        wx.setClipboardData({
            data: this.data.history.join("\n"),
            success: (res) => {
                wx.showToast({
                    title: "已复制",
                    icon: "success",
                    duration: 1500,
                    mask: true,
                })
            },
            fail: (res) => {
                wx.showToast({
                    title: "复制失败",
                    icon: "error",
                    duration: 1500,
                    mask: true,
                })
            },
        })
    },

    onClickImport() {
        let that = this;
        wx.showModal({
            title: "导入数据",
            editable: true,
            placeholderText: "请在此处粘贴数据",
            complete(res) {
                if (!res.confirm)
                    return;
                let data = res.content.split("\n").map(s => s.trim())
                let pattern = /^F\d{13}$/;
                let count = {
                    success: 0,
                    exist: 0,
                };
                let history = that.data.history;
                for (let datum of data) {
                    if (datum.match(pattern)) {
                        if (history.includes(datum)) {
                            count.exist++;
                        } else {
                            count.success++;
                            history.push(datum)
                        }
                    }
                }
                let prompt = `成功导入${count.success}本`
                if (count.exist != 0) {
                    prompt += `，${count.exist}本已在库内`
                }
                wx.showModal({
                  content: prompt,
                  showCancel: false,
                })
                wx.setStorage({
                    key: "history",
                    data: history
                })
                that.setData({
                    history: history,
                    num: history.length,
                })
            }
        })
    },

    onValidInput(bookid) {
        let history = this.data.history;
        if (history.includes(bookid)) {
            this.setData({
                result: bookid
            });
            wx.showToast({
                title: "已读",
                icon: "success",
                duration: 1500,
                mask: true,
            })
        } else {
            history.unshift(bookid)
            wx.setStorage({
                key: "history",
                data: history
            })
            this.setData({
                result: bookid,
                history: history,
                num: history.length,
            })
            wx.showToast({
                title: "新入库",
                icon: "success",
                duration: 1500,
                mask: true
            })
        }
    },
})