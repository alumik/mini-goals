import Fly from 'miniprogram_npm/flyio/index'

const prodURL = 'https://aliyun.alumik.cn:5181/api/v1/'
const devURL = 'http://localhost/api/v1/'
const fly = new Fly()
fly.config.baseURL = prodURL

App({
    onLaunch: function () {
        wx.login({
            success: res => {
                fly.post('user', {
                    code: res.code
                }).then(response => {
                    fly.config.headers = {
                        'Session-ID': response.data.sessionId
                    }
                    this.globalData.sessionIdReady = true
                    if (this.onSessionIdReady) {
                        this.onSessionIdReady()
                    }
                }).catch(err => {
                    console.log(err)
                })
            }
        })
    },

    globalData: {
        fly: fly,
        sessionIdReady: false
    }
})