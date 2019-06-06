const Fly = require('miniprogram_npm/flyio/index')
const fly = new Fly()
const server = 'https://aliyun.alumik.cn:5181/api/v1/'

App({
    onLaunch: function () {
        wx.login({
            success: res => {
                const app = this
                fly.post(this.globalData.server.user, {
                    code: res.code
                }).then(response => {
                    app.globalData.openid = response.data.openid
                    if (app.openidReadyCallback) {
                        app.openidReadyCallback()
                    }
                }).catch(err => {
                    console.log(err)
                })
            }
        })
    },

    globalData: {
        fly: fly,
        openid: null,
        server: {
            user: server + 'user',
            task: server + 'task',
            task_list: server + 'task-list',
            task_label: server + 'task-label'
        }
    }
})