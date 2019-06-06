const app = getApp()
const fly = app.globalData.fly

Page({
    /**
     * 页面的初始数据
     */
    data: {
        // 私有变量
        mIdTaskList: 0,
        mCreateLabel: '',
        mLabelNameTooLong: false,

        // 页面数据
        mLabels: []
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
        this.loadLabels()
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.loadLabels()
        wx.stopPullDownRefresh()
    },

    /**
     * 加载标签
     */
    loadLabels: function () {
        wx.showLoading({
            title: '加载中'
        })

        const getCheckedLabels = fly.get('task-list', {
            id_task_list: this.data.mIdTaskList
        })
        const getAllLabels = fly.get('task-label')

        fly.all([getCheckedLabels, getAllLabels]).then(
            fly.spread((checkedLabels, allLabels) => {
                checkedLabels = checkedLabels.data.labels
                allLabels = allLabels.data
                for (let label of allLabels) {
                    for (let checkedLabel of checkedLabels) {
                        if (label.id === checkedLabel.id) {
                            label.checked = true
                            break
                        }
                    }
                }
                this.setData({
                    mLabels: allLabels
                })
                wx.hideLoading()
            })
        ).catch(err => {
            console.log(err)
        })
    },

    /**
     * 输入响应函数--创建标签
     *
     * @param e
     */
    inputCreateLabel: function (e) {
        this.setData({
            mLabelNameTooLong: e.detail.value.length > 10,
            mCreateLabel: e.detail.value
        })
    },

    /**
     * 创建标签
     */
    createLabel: function () {
        if (this.data.mCreateLabel.length <= 10 && this.data.mCreateLabel !== '') {
            for (let label of this.data.mLabels) {
                if (label.name === this.data.mCreateLabel) {
                    return
                }
            }
            this.data.mLabels.push({
                name: this.data.mCreateLabel,
                checked: true
            })
            this.setData({
                mCreateLabel: '',
                mLabelNameTooLong: false,
                mLabels: this.data.mLabels
            })
        }
    },

    /**
     * 选择标签
     *
     * @param e
     */
    checkLabels: function (e) {
        const labels = this.data.mLabels
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
            mLabels: labels
        })
    },

    /**
     * 保存
     */
    save: function () {
        const labels = []
        for (let label of this.data.mLabels) {
            if (label.checked) {
                labels.push(label.name)
            }
        }
        fly.post('task-label', {
            id_task_list: this.data.mIdTaskList,
            labels: labels
        }).then(response => {
            wx.navigateBack()
        }).catch(err => {
            console.log(err)
        })
    }
})