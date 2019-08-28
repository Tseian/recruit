const __config = {
    modemSocketApi: 'http://10.28.1.172:13306',
    modemBackEndApi: 'http://10.28.1.172:3330',
};

const http = type => (url, data) => $.ajax({
    "async": true,
    "crossDomain": true,
    "url": url,
    "type": type,
    "headers": {
        "content-type": "application/json",
        "cache-control": "no-cache",
        "authorization": "RrlLN0dQxnHTzSjf4ybPEK7MOF8t"
    },
    "processData": false,
    "timeout": 3000,
    "data": type === 'POST' ? JSON.stringify(data || {}) : data
});

const httpGet = http('GET');
const httpPost = http('POST');

let account = null;
let platform = "速卖通";
let accounts = [];
let loopIndex = 0;
let allIndex = 0;
let isOK = false;

// 获取账户
const getAccount = () => httpGet(`${__config.modemBackEndApi}/v1/account/list_crawler?platform=${platform}`);

// 上线轮询
const isOnline = data => httpPost(__config.modemSocketApi + '/account/is_online', data);

// 设置上线
const setOnline = data => httpPost(__config.modemSocketApi + '/account/online', data);

// 消息轮询
const getMessage = data => httpPost(__config.modemSocketApi + '/account/sms', data);

// 保存cookie
const setCookie = data => httpPost(__config.modemBackEndApi + '/v1/account/cookie', data);

// 获取cookie
const getCookie = data => httpGet(__config.modemBackEndApi + '/v1/account/cookie', data);

// 账户轮询
const accountLoop = res => {
    if (loopIndex >= accounts.length) {
        allIndex++;
        loopIndex = 0;
        accounts = [];
        return getAccount().done(value => {
            accounts = value.data.list;
            if (!accounts.length) {
                setTimeout(() => {
                    accountLoop(res);
                }, 5000);
                return;
            }
            allIndex = 0;
            accountLoop(res);
        });
    } else {
        let message = accounts[loopIndex] || {};
        account = message.account;
        // platform = message.platform;
        res(accounts[loopIndex]);
        loopIndex = loopIndex + 1;
        return;
    }
};

// 验证码提取
const extract = content => {
    if (!content) return null;
    let codes = content.match(/\d+/);
    return codes && codes[0];
};

// cookie parse
const cookieParse = search => {
    let query = search.split(";").reduce((s, kv) => {
        let [k, v] = kv.split("=");
        s[decodeURIComponent(k).trim()] = decodeURIComponent(v);
        return s;
    }, {});
};

// 操作处理
chrome.runtime.onMessage.addListener((message, sender, res) => {
    switch (message.type) {
        // 轮询手机卡是否在线
        case 'loop_online':
            {
                // 设置手机号上线
                if (!account || (!!account && message.data.account !== account)) {
                    setOnline(message.data).done(value => {
                        let data = !!value.data && value.data.success;
                        res(data);
                    });
                } else {
                    isOnline(message.data).done(value => {
                        res(value.data || {});
                    });
                }
                return true;
            }
            // 轮询手机卡信息
        case 'loop_message':
            {
                getMessage(message.data).then(value => {
                    let content = value.data && value.data[0] && value.data[0].smsContent;
                    let verify = extract(content);
                    res({
                        verify,
                        isExpired: value.code === 4003
                    });
                });
                return true;
            }
            // cookies 轮询
        case 'cookie':
            {
                // 设置cookie
                console.log(message);
                chrome.cookies.set({
                    "path": "/",
                    "url": "https://www.aliexpress.com",
                    "name": "test_cookie",
                    "value": "adadasdasdas",
                    "domain": "www.aliexpress.com"
                }, () => {
                    res(true);
                });

                // getCookie(message.data).then(cookie => {
                //     if (!cookie) return res(false);
                //     chrome.cookies.set({
                //         "url": "https://fund.aliexpress.com/fundIndex.htm",
                //         "name": "Cookie",
                //         "value": cookie,
                //         "domain": ".aliexpress.com"
                //     }, () => {
                //         res(true);
                //     });
                // }).catch(() => res(false));
                return true;
            }
    }
});