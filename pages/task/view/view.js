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
        this.refreshPage()
    },

    onPullDownRefresh: function () {
        this.refreshPage()
        wx.stopPullDownRefresh();
    },

    refreshPage: function () {
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

    inputTaskListName: function (e) {
        this.setData({
            'm_task_list.name': e.detail.value
        })
    },

    inputTaskName: function (e) {
        const index = e.currentTarget.dataset.index
        if (e.currentTarget.dataset.type === 'unfinished') {
            this.data.m_task_list.grouped_tasks.unfinished.content[index].content = e.detail.value
        } else {
            this.data.m_task_list.grouped_tasks.finished.content[index].content = e.detail.value
        }
        this.setData({
            m_task_list: this.data.m_task_list
        })
    },

    updateTask: function (e) {
        const index = e.currentTarget.dataset.index
        let task = null
        if (e.currentTarget.dataset.type === 'unfinished') {
            task = this.data.m_task_list.grouped_tasks.unfinished.content[index]
        } else {
            task = this.data.m_task_list.grouped_tasks.finished.content[index]
        }
        fly.put(app.globalData.server_url.task, {
            openid: app.globalData.openid,
            content: task
        }).catch(err => {
            console.log(err)
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
    },

    changeUnfinished: function (e) {
        const self = this
        const values = e.detail.value;
        const requests = []
        for (let task of this.data.m_task_list.grouped_tasks.unfinished.content) {
            if (values.indexOf(task.id.toString()) !== -1) {
                task.finished = 1
                requests.push(fly.put(app.globalData.server_url.task, {
                    openid: app.globalData.openid,
                    content: {
                        id: task.id,
                        finished: 1
                    }
                }))
            }
        }
        fly.all(requests).then(
            fly.spread(function () {
                self.refreshPage()
            })
        ).catch(err => {
            console.log(err)
        })
    },

    changeFinished: function (e) {
        const self = this
        const values = e.detail.value;
        const requests = []
        for (let task of this.data.m_task_list.grouped_tasks.finished.content) {
            if (values.indexOf(task.id.toString()) === -1) {
                task.finished = 0
                requests.push(fly.put(app.globalData.server_url.task, {
                    openid: app.globalData.openid,
                    content: {
                        id: task.id,
                        finished: 0
                    }
                }))
            }
        }
        fly.all(requests).then(
            fly.spread(function () {
                self.refreshPage()
            })
        ).catch(err => {
            console.log(err)
        })
    }
})