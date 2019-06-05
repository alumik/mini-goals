const app = getApp()
const fly = app.globalData.fly

Page({
    data: {
        search_showed: false,
        archived: 0,
        search_val: '',
        task_lists: []
    },

    onLoad: function (options) {
        if (app.globalData.openid) {
            this.loadTaskLists()
        } else {
            app.openidReadyCallback = () => {
                this.loadTaskLists()
            }
        }
    },

    onPullDownRefresh: function (options) {
        this.loadTaskLists()
    },

    loadTaskLists: function () {
        const self = this
        fly.get(app.globalData.server_url.task_list, {
            openid: app.globalData.openid,
            archived: this.data.archived,
            name: this.data.search_val
        }).then(function (response) {
            self.setData({
                task_lists: response.data
            })
        }).catch(err => {
            console.log(err)
        })
    },

    applySearch: function () {
        this.loadTaskLists()
    },

    showInput: function () {
        this.setData({
            search_showed: true
        })
    },

    hideInput: function () {
        this.setData({
            search_val: '',
            search_showed: false
        })
    },

    clearInput: function () {
        this.setData({
            search_val: ''
        })
    },

    inputTyping: function (e) {
        this.setData({
            search_val: e.detail.value
        })
    }
})