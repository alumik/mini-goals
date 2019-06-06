//app.js

const Fly = require('miniprogram_npm/flyio/index')
const fly = new Fly()
const local_server = 'http://localhost/api/v1/'
const server = 'https://aliyun.alumik.cn:5181/api/v1/'

App({
    onLaunch: function () {
        wx.login({
            success: res => {
                const app = this
                fly.post(this.globalData.server.user, {
                    code: res.code
                }).then(function (response) {
                    app.globalData.openid = response.data.openid
                    if (app.openidReadyCallback) {
                        app.openidReadyCallback()
                    }
                }).catch(err => {
                    console.log(err)
                })
            }
        })

        wx.getSetting({
            success: res => {
                if (res.authSetting['scope.userInfo']) {
                    wx.getUserInfo({
                        success: res => {
                            console.log(res.userInfo)
                            this.globalData.userInfo = res.userInfo

                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }

                            fly.put(this.globalData.server.user, {
                                openid: this.globalData.openid,
                                content: {
                                    name: res.userInfo.nickName,
                                    avatar: res.userInfo.avatarUrl
                                }
                            }).catch(err => {
                                console.log(err)
                            })
                        }
                    })
                }
            }
        })
    },

    globalData: {
        fly: fly,
        userInfo: null,
        openid: null,
        server: {
            user: server + 'user',
            task: server + 'task',
            task_list: server + 'task-list',
            task_label: server + 'task-label'
        }
    }
})