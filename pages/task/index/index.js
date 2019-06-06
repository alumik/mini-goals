const app = getApp()
const fly = app.globalData.fly

Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 私有变量
        mSearchShowed: false,
        mCreateTaskList: '',
        mFilterName: '',
        mFilterArchived: 0,
        mFilterIdLabel: 0,

        // 页面数据
        mTaskLists: [],
        mLabels: []
    },

    /**
     * 生命周期函数--监听页面显示
     *
     * @param options
     */
    onShow: function (options) {
        if (app.globalData.openid) {
            this.loadTaskLists()
            this.loadLabels()
        } else {
            app.onOpenidReady = () => {
                this.loadTaskLists()
                this.loadLabels()
            }
        }
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.loadTaskLists()
        this.loadLabels()
        wx.stopPullDownRefresh()
    },

    /**
     * 加载任务清单
     */
    loadTaskLists: function () {
        wx.showLoading({
            title: '加载中'
        })
        fly.get('task-list', {
            openid: app.globalData.openid,
            archived: this.data.mFilterArchived,
            name: this.data.mFilterName,
            label: this.data.mFilterIdLabel
        }).then(response => {
            this.setData({
                mTaskLists: response.data
            })
            wx.hideLoading()
        }).catch(err => {
            console.log(err)
        })
    },

    /**
     * 加载标签
     */
    loadLabels: function () {
        fly.get('task-label', {
            openid: app.globalData.openid
        }).then(response => {
            this.setData({
                mLabels: response.data
            })
        }).catch(err => {
            console.log(err)
        })
    },

    /**
     * 输入响应函数--创建任务清单
     *
     * @param e
     */
    inputCreateTaskList: function (e) {
        this.setData({
            mCreateTaskList: e.detail.value
        })
    },

    /**
     * 输入响应函数--按名称搜索
     *
     * @param e
     */
    inputFilterName: function (e) {
        this.setData({
            mFilterName: e.detail.value
        })
    },

    /**
     * 按名称搜索
     */
    applyFilterName: function () {
        this.loadTaskLists()
    },

    /**
     * 按标签 ID 搜索
     *
     * @param e
     */
    applyFilterIdLabel: function (e) {
        this.setData({
            mFilterIdLabel: parseInt(e.currentTarget.dataset.id)
        })
        this.loadTaskLists()
    },

    /**
     * 按是否归档搜索
     *
     * @param e
     */
    applyFilterArchived: function (e) {
        this.setData({
            mFilterArchived: parseInt(e.currentTarget.dataset.archived)
        })
        this.loadTaskLists()
    },

    /**
     * 创建任务清单
     */
    createTaskList: function () {
        if (this.data.mCreateTaskList !== '') {
            fly.post('task-list', {
                openid: app.globalData.openid,
                content: {
                    name: this.data.mCreateTaskList
                }
            }).then(response => {
                this.setData({
                    mCreateTaskList: ''
                })
                this.loadTaskLists()
            }).catch(err => {
                console.log(err)
            })
        }
    },

    /**
     * 排序任务清单
     *
     * @param e
     */
    sortTaskLists: function (e) {
        const index = parseInt(e.currentTarget.dataset.index)
        const dir = parseInt(e.currentTarget.dataset.dir)

        if (dir === -1 && index > 0 || dir === 1 && index < this.data.mTaskLists.length) {
            fly.put('task-list', {
                openid: app.globalData.openid,
                content: [
                    {
                        id: this.data.mTaskLists[index].id,
                        order: this.data.mTaskLists[index + dir].order
                    },
                    {
                        id: this.data.mTaskLists[index + dir].id,
                        order: this.data.mTaskLists[index].order
                    }
                ]
            }).then(response => {
                this.loadTaskLists()
            }).catch(err => {
                console.log(err)
            })
        }
    },

    /**
     * 查看任务清单详情
     *
     * @param e
     */
    viewTaskList: function (e) {
        wx.navigateTo({
            url: '/pages/task/view/view?id=' + e.currentTarget.dataset.id
        })
    },

    /**
     * 完成任务
     *
     * @param e
     */
    checkTask: function (e) {
        fly.put('task', {
            openid: app.globalData.openid,
            content: {
                id: parseInt(e.currentTarget.dataset.id),
                finished: 1
            }
        }).then(response => {
            this.loadTaskLists()
        }).catch(err => {
            console.log(err)
        })
    },

    /**
     * 显示搜索框
     */
    showFilterName: function () {
        this.setData({
            mSearchShowed: true
        })
    },

    /**
     * 隐藏搜索框
     */
    hideFilterName: function () {
        this.setData({
            mFilterName: '',
            mSearchShowed: false
        })
    },

    /**
     * 清空搜索框
     */
    clearFilterName: function () {
        this.setData({
            mFilterName: ''
        })
    }
})