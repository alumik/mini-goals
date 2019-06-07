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
        if (app.globalData.sessionIdReady) {
            this.loadTaskLists()
            this.loadLabels()
        } else {
            app.onSessionIdReady = () => {
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
        fly.get('task-label').then(response => {
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
                name: this.data.mCreateTaskList
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
            const listA = this.data.mTaskLists[index]
            const listB = this.data.mTaskLists[index + dir]

            const tmpOrder = listA.order
            listA.order = listB.order
            listB.order = tmpOrder

            fly.put('task-list', {
                data: [listA, listB]
            }).catch(err => {
                console.log(err)
            })

            this.data.mTaskLists[index] = listB
            this.data.mTaskLists[index + dir] = listA
            this.setData({
                mTaskLists: this.data.mTaskLists
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
        const taskListIndex = parseInt(e.currentTarget.dataset.taskListIndex)
        const taskIndex = parseInt(e.currentTarget.dataset.taskIndex)
        const unfinished = this.data.mTaskLists[taskListIndex].tasks.unfinished.content
        const finished = this.data.mTaskLists[taskListIndex].tasks.finished.content
        const task = unfinished[taskIndex]

        task.finished = 1
        this.data.mTaskLists[taskListIndex].tasks.finished.count += 1
        this.data.mTaskLists[taskListIndex].tasks.unfinished.count -= 1
        unfinished.splice(taskIndex, 1)

        let set = false
        for (let i = 0; i < finished.length; i++) {
            if (task.id < finished[i].id) {
                finished.splice(i, 0, task)
                set = true
                break
            }
        }
        if (!set) {
            finished.push(task)
        }

        fly.put('task', task).catch(err => {
            console.log(err)
        })
        this.setData({
            mTaskLists: this.data.mTaskLists
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