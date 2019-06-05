// pages/task/view/view.js

const app = getApp()
const fly = app.globalData.fly

Page({
    data: {
        m_task_list_id: 0,

        m_task_list: null
    },

    onLoad: function (options) {
        this.setData({
            m_task_list_id: options.id
        })
    },

    onShow: function () {
        const self = this
        fly.get(app.globalData.server_url.task_list, {
            openid: app.globalData.openid,
            id_task_list: this.data.m_task_list_id
        }).then(function (response) {
            self.setData({
                m_task_list: response.data
            })
        }).catch(err => {
            console.log(err)
        })
    },

    onPullDownRefresh: function () {

    },

    inputTaskListName: function (e) {
        this.setData({
            'm_task_list.name': e.detail.value
        })
    },

    updateTaskList: function () {
        const self = this
        fly.put(app.globalData.server_url.task_list, {
            openid: app.globalData.openid,
            content: [this.data.m_task_list]
        }).catch(err => {
            console.log(err)
        })
    }
})