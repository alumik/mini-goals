import Fly from 'miniprogram_npm/flyio/index'

const fly = new Fly()
fly.config.baseURL = 'https://aliyun.alumik.cn:5181/api/v1/'

App({
    onLaunch: function () {
        wx.login({
            success: res => {
                fly.post('user', {
                    code: res.code
                }).then(response => {
                    this.globalData.openid = response.data.openid
                    if (this.onOpenidReady) {
                        this.onOpenidReady()
                    }
                }).catch(err => {
                    console.log(err)
                })
            }
        })
    },

    globalData: {
        fly: fly,
        openid: null
    }
})