const app = getApp()
const fly = app.globalData.fly

Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 私有变量
        mIdTaskList: 0,
        mCreateTask: '',

        // 页面数据
        mTaskList: {
            id: 0,
            name: '加载中',
            archived: 0,
            labels: [],
            tasks: {
                unfinished: {
                    count: 0,
                    content: []
                },
                finished: {
                    count: 0,
                    content: []
                }
            }
        }
    },

    /**
     * 生命周期函数--监听页面加载
     *
     * @param options
     */
    onLoad: function (options) {
        this.setData({
            mIdTaskList: parseInt(options.id)
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.loadTaskList()
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.loadTaskList()
        wx.stopPullDownRefresh()
    },

    /**
     * 加载任务清单
     */
    loadTaskList: function () {
        wx.showLoading({
            title: '加载中'
        })
        fly.get('task-list', {
            id_task_list: this.data.mIdTaskList
        }).then(response => {
            this.setData({
                mTaskList: response.data
            })
            wx.hideLoading()
        }).catch(err => {
            console.log(err)
        })
    },

    /**
     * 输入响应函数--修改任务清单名
     *
     * @param e
     */
    inputTaskListName: function (e) {
        this.setData({
            'mTaskList.name': e.detail.value
        })
    },

    /**
     * 输入响应函数--修改任务名
     *
     * @param e
     */
    inputTaskName: function (e) {
        const task = this.getTask(
            parseInt(e.currentTarget.dataset.finished),
            parseInt(e.currentTarget.dataset.index)
        )
        task.content = e.detail.value
        this.setData({
            mTaskList: this.data.mTaskList
        })
    },

    /**
     * 输入响应函数--创建任务
     *
     * @param e
     */
    inputCreateTask: function (e) {
        this.setData({
            mCreateTask: e.detail.value
        })
    },

    /**
     * 聚焦响应函数--点击任务
     *
     * @param e
     */
    focusTask: function (e) {
        const task = this.getTask(
            parseInt(e.currentTarget.dataset.finished),
            parseInt(e.currentTarget.dataset.index)
        )
        task.focus = true
        task.oldContent = task.content
        this.setData({
            mTaskList: this.data.mTaskList
        })
    },

    /**
     * 获取任务对象
     */
    getTask: function (finished, index) {
        if (finished === 0) {
            return this.data.mTaskList.tasks.unfinished.content[index]
        }
        return this.data.mTaskList.tasks.finished.content[index]
    },

    /**
     * 本地移除任务
     *
     * @param finished
     * @param index
     */
    removeTask: function (finished, index) {
        if (finished === 0) {
            this.data.mTaskList.tasks.unfinished.content.splice(index, 1)
        } else {
            this.data.mTaskList.tasks.finished.content.splice(index, 1)
        }
        this.setData({
            mTaskList: this.data.mTaskList
        })
    },

    /**
     * 本地插入任务
     *
     * @param finished
     * @param task
     */
    insertTask: function (finished, task) {
        const array = finished === 0 ? this.data.mTaskList.tasks.unfinished.content : this.data.mTaskList.tasks.finished.content
        for (let i = 0; i < array.length; i++) {
            if (task.id < array[i].id) {
                array.splice(i, 0, task)
                this.setData({
                    mTaskList: this.data.mTaskList
                })
                return
            }
        }
        array.push(task)
        this.setData({
            mTaskList: this.data.mTaskList
        })
    },

    /**
     * 创建任务
     *
     * @param e
     */
    createTask: function (e) {
        if (this.data.mCreateTask !== '') {
            fly.post('task', {
                id_task_list: this.data.mIdTaskList,
                content: this.data.mCreateTask
            }).then(response => {
                this.setData({
                    mCreateTask: ''
                })
                this.loadTaskList()
            }).catch(err => {
                console.log(err)
            })
        }
    },

    /**
     * 更新任务
     *
     * @param e
     */
    updateTask: function (e) {
        const task = this.getTask(
            parseInt(e.currentTarget.dataset.finished),
            parseInt(e.currentTarget.dataset.index)
        )
        if (task) {
            task.focus = false
            this.setData({
                mTaskList: this.data.mTaskList
            })
            if (task.oldContent && task.oldContent !== task.content && task.content !== '') {
                fly.put('task', task).catch(err => {
                    console.log(err)
                })
            }
        }
    },

    /**
     * 完成任务
     *
     * @param e
     */
    checkTask: function (e) {
        const values = e.detail.value
        const requests = []

        for (let task of this.data.mTaskList.tasks.unfinished.content) {
            if (values.indexOf(task.id.toString()) !== -1) {
                task.finished = 1
                requests.push(fly.put('task', {
                    id: task.id,
                    finished: 1
                }))
                this.removeTask(0, this.data.mTaskList.tasks.unfinished.content.indexOf(task))
                this.insertTask(1, task)
            }
        }

        fly.all(requests).catch(err => {
            console.log(err)
        })
    },

    /**
     * 取消完成任务
     *
     * @param e
     */
    uncheckTask: function (e) {
        const values = e.detail.value
        const requests = []

        for (let task of this.data.mTaskList.tasks.finished.content) {
            if (values.indexOf(task.id.toString()) === -1) {
                task.finished = 0
                requests.push(fly.put('task', {
                    id: task.id,
                    finished: 0
                }))
                this.removeTask(1, this.data.mTaskList.tasks.finished.content.indexOf(task))
                this.insertTask(0, task)
            }
        }

        fly.all(requests).catch(err => {
            console.log(err)
        })
    },

    /**
     * 归档或取消归档任务
     */
    archiveTask: function () {
        fly.put('task-list', {
            data: [
                {
                    id: this.data.mIdTaskList,
                    archived: this.data.mTaskList.archived === 0 ? 1 : 0
                }
            ]
        }).then(response => {
            this.setData({
                'mTaskList.archived': this.data.mTaskList.archived === 0 ? 1 : 0
            })
        }).catch(err => {
            console.log(err)
        })
    },

    /**
     * 删除任务
     *
     * @param e
     */
    deleteTask: function (e) {
        const finished = parseInt(e.currentTarget.dataset.finished)
        const index = parseInt(e.currentTarget.dataset.index)
        const task = this.getTask(finished, index)

        fly.delete('task', {
            id_task: task.id
        }).catch(err => {
            console.log(err)
        })

        this.removeTask(finished, index)
    },

    /**
     * 修改任务清单名
     */
    updateTaskList: function () {
        fly.put('task-list', {
            data: [
                this.data.mTaskList
            ]
        }).catch(err => {
            console.log(err)
        })
    },

    /**
     * 删除任务清单
     */
    deleteTaskList: function () {
        wx.showModal({
            title: '删除任务清单',
            content: '确定要删除该任务清单吗？删除后无法撤销。',
            success: res => {
                if (res.confirm) {
                    fly.delete('task-list', {
                        id_task_list: this.data.mIdTaskList
                    }).then(response => {
                        wx.navigateBack()
                    }).catch(err => {
                        console.log(err)
                    })
                }
            }
        })
    }
})