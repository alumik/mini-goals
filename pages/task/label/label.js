// pages/task/label/label.js

const app = getApp()
const fly = app.globalData.fly

Page({
    /**
     * 页面的初始数据
     */
    data: {
        m_task_list_id: 0,
        m_create_label_str: '',
        m_too_long: false,

        m_labels: null
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            m_task_list_id: options.id
        })
        this.refreshPage()
    },

    save: function () {
        const labels = []
        for (let label of this.data.m_labels) {
            if (label.checked) {
                labels.push(label.name)
            }
        }
        fly.post(app.globalData.server.task_label, {
            openid: app.globalData.openid,
            content: {
                id_task_list: this.data.m_task_list_id,
                labels: labels
            }
        }).then(function (response) {
            wx.navigateBack()
        }).catch(err => {
            console.log(err)
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.refreshPage()
        wx.stopPullDownRefresh()
    },

    refreshPage: function () {
        const self = this
        wx.showLoading({
            title: '加载中',
        })

        const get_checked_labels = fly.get(app.globalData.server.task_list, {
            openid: app.globalData.openid,
            id_task_list: this.data.m_task_list_id
        })
        const get_all_labels = fly.get(app.globalData.server.task_label, {
            openid: app.globalData.openid
        })

        fly.all([get_all_labels, get_checked_labels]).then(fly.spread(function (all_labels, checked_labels) {
            checked_labels = checked_labels.data.labels
            all_labels = all_labels.data
            for (let label of all_labels) {
                for (let checked_label of checked_labels) {
                    if (label.id === checked_label.id) {
                        label.checked = true
                        break
                    }
                }
            }
            self.setData({
                m_labels: all_labels
            })
            wx.hideLoading()
        })).catch(err => {
            console.log(err)
        })
    },

    inputCreateLabel: function (e) {
        if (e.detail.value.length > 10) {
            this.setData({
                m_too_long: true,
                m_create_label_str: e.detail.value
            })
        } else {
            this.setData({
                m_too_long: false,
                m_create_label_str: e.detail.value
            })
        }
    },

    createLabel: function () {
        if (this.data.m_create_label_str.length > 10 || this.data.m_create_label_str === '') {
            return
        }
        for (let label of this.data.m_labels) {
            if (label.name === this.data.m_create_label_str) {
                return
            }
        }
        this.data.m_labels.push({
            name: this.data.m_create_label_str,
            checked: true
        })
        this.setData({
            m_create_label_str: '',
            m_too_long: false,
            m_labels: this.data.m_labels
        })
    },

    checkboxChange: function (e) {
        const labels = this.data.m_labels
        const values = e.detail.value

        for (let label of labels) {
            label.checked = false
            for (let value of values) {
                if (label.name === value) {
                    label.checked = true
                    break
                }
            }
        }

        this.setData({
            m_labels: labels
        })
    }
})