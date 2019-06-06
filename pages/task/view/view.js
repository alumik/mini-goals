// pages/task/view/view.js

const app = getApp()
const fly = app.globalData.fly

Page({
    data: {
        m_task_list_id: 0,
        m_create_task_str: '',

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
        wx.stopPullDownRefresh()
    },

    refreshPage: function () {
        const self = this
        wx.showLoading({
            title: '加载中',
        })
        fly.get(app.globalData.server_url.task_list, {
            openid: app.globalData.openid,
            id_task_list: this.data.m_task_list_id
        }).then(function (response) {
            self.setData({
                m_task_list: response.data
            })
            wx.hideLoading()
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

    inputCreateTask: function (e) {
        this.setData({
            m_create_task_str: e.detail.value
        })
    },

    taskFocus: function (e) {
        const index = e.currentTarget.dataset.index
        let task = null
        if (e.currentTarget.dataset.type === 'unfinished') {
            task = this.data.m_task_list.grouped_tasks.unfinished.content[index]
        } else {
            task = this.data.m_task_list.grouped_tasks.finished.content[index]
        }
        task.focus = true
        task.old_content = task.content
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
        task.focus = false
        this.setData({
            m_task_list: this.data.m_task_list
        })
        if (task.old_content && task.old_content !== task.content && task.content !== '') {
            fly.put(app.globalData.server_url.task, {
                openid: app.globalData.openid,
                content: task
            }).catch(err => {
                console.log(err)
            })
        }
    },

    deleteTask: function (e) {
        const self = this
        fly.delete(app.globalData.server_url.task, {
            openid: app.globalData.openid,
            id_task: e.currentTarget.dataset.id
        }).then(function (response) {
            self.refreshPage()
        }).catch(err => {
            console.log(err)
        })
    },

    deleteTaskList: function (e) {
        const self = this
        wx.showModal({
            title: '删除目标清单',
            content: '确定要删除该目标清单吗？删除后无法撤销。',
            success: function (sm) {
                if (sm.confirm) {
                    fly.delete(app.globalData.server_url.task_list, {
                        openid: app.globalData.openid,
                        id_task_list: self.data.m_task_list_id
                    }).then(function (response) {
                        wx.navigateBack()
                    }).catch(err => {
                        console.log(err)
                    })
                }
            }
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

    createTask: function (e) {
        const self = this
        if (this.data.m_create_task_str !== '') {
            fly.post(app.globalData.server_url.task, {
                openid: app.globalData.openid,
                content: {
                    id_task_list: this.data.m_task_list_id,
                    content: this.data.m_create_task_str
                }
            }).then(function (response) {
                self.setData({
                    m_create_task_str: ''
                })
                self.refreshPage()
            }).catch(err => {
                console.log(err)
            })
        }
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
    },

    archive: function () {
        const self = this
        fly.put(app.globalData.server_url.task_list, {
            openid: app.globalData.openid,
            content: [
                {
                    "id": this.data.m_task_list_id,
                    "archived": this.data.m_task_list.archived === 0 ? 1 : 0
                }
            ]
        }).then(function (response) {
            self.refreshPage()
        }).catch(err => {
            console.log(err)
        })
    }
})