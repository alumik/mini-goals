//app.js

const Fly = require('miniprogram_npm/flyio/index')
const fly = new Fly()
const server_url = 'http://localhost/api/v1/'

App({
    onLaunch: function () {
        wx.login({
            success: res => {
                const app = this
                fly.post(this.globalData.server_url.user, {
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
                            this.globalData.userInfo = res.userInfo

                            if (this.userInfoReadyCallback) {
                                this.userInfoReadyCallback(res)
                            }

                            fly.put(this.globalData.server_url.user, {
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
        server_url: {
            user: server_url + 'user',
            task_list: server_url + 'task-list',
            task_label: server_url + 'task-label'
        }
    }
})