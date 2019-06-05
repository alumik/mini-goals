const app = getApp()
const fly = app.globalData.fly

Page({
    data: {
        m_search_showed: false,

        m_name: '',
        m_archived: 0,
        m_label: 0,

        m_task_lists: [],
        m_labels: [],
    },

    onLoad: function (options) {
        if (app.globalData.openid) {
            this.loadTaskLists()
            this.loadLabels()
        } else {
            app.openidReadyCallback = () => {
                this.loadTaskLists()
                this.loadLabels()
            }
        }
    },

    onPullDownRefresh: function (options) {
        this.loadTaskLists()
        this.loadLabels()
        wx.stopPullDownRefresh();
    },

    loadTaskLists: function () {
        const self = this
        fly.get(app.globalData.server_url.task_list, {
            openid: app.globalData.openid,
            archived: this.data.m_archived,
            name: this.data.m_name,
            label: this.data.m_label
        }).then(function (response) {
            self.setData({
                m_task_lists: response.data
            })
        }).catch(err => {
            console.log(err)
        })
    },

    loadLabels: function () {
        const self = this
        fly.get(app.globalData.server_url.task_label, {
            openid: app.globalData.openid
        }).then(function (response) {
            self.setData({
                m_labels: response.data
            })
        }).catch(err => {
            console.log(err)
        })
    },

    applySearch: function () {
        this.loadTaskLists()
    },

    applyLabel: function (e) {
        this.setData({
            m_label: e.currentTarget.dataset.id
        })
        this.loadTaskLists()
    },

    sortTaskList: function (e) {

        const self = this
        const index = e.currentTarget.dataset.index;
        const dir = e.currentTarget.dataset.dir;
        if (dir === -1 && index > 0 || dir === 1 && index < this.data.m_task_lists.length) {
            fly.put(app.globalData.server_url.task_list, {
                openid: app.globalData.openid,
                content: [{
                    "id": this.data.m_task_lists[index].id,
                    "order": this.data.m_task_lists[index + dir].order
                },
                {
                    "id": this.data.m_task_lists[index + dir].id,
                    "order": this.data.m_task_lists[index].order
                }
                ]
            }).then(function (response) {
                self.loadTaskLists()
            }).catch(err => {
                console.log(err)
            })
        }
    },

    showInput: function () {
        this.setData({
            m_search_showed: true
        })
    },

    hideInput: function () {
        this.setData({
            m_name: '',
            m_search_showed: false
        })
    },

    clearInput: function () {
        this.setData({
            m_name: ''
        })
    },

    inputTyping: function (e) {
        this.setData({
            m_name: e.detail.value
        })
    }
})