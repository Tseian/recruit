let platform = "速卖通";
let timer = {};
let isOk = false;

document.domain = 'aliexpress.com';

function loopOnline(account) {
    timer.online && clearInterval(timer.online);
    timer.online = setInterval(() => chrome.runtime.sendMessage({
        type: "loop_online",
        data: {
            account,
            platform
        }
    }, res => {
        if (!res.success) return;
        clearInterval(timer.online);
        loopMessage(account, res.dateTime);
    }), 500);
}

function loopMessage(account, startDateTime) {
    timer.message && clearInterval(timer.message);
    timer.message = setInterval(() => chrome.runtime.sendMessage({
        type: "loop_message",
        data: {
            account,
            platform,
            startDateTime
        }
    }, res => {
        if (res.isExpired) {
            $("#J_GetCode").trigger("click");
            return;
        }
        if (!res.verify) return;
        // 验证码回调
        document.domain = 'aliexpress.com';
        $("#J_Checkcode").prop("value", res.verify);
        slideLoop();
        $("#btn-submit").trigger("click");
        clearInterval(timer.message);
        clearInterval(timer.online);
        clearInterval(timer.code);
    }), 500);
}

function loopEntry() {
    timer.code = setTimeout(() => {
        document.domain = 'aliexpress.com';
        if (!$("#J_Checkcode").length) {
            return;
        }
        chrome.storage.sync.get('login_proxy_account', value => {
            let account = value && value.login_proxy_account;
            if (!account) return;
            loopOnline(account);
        });
    }, 1000);
}


function fill(res = {}) {
    if (!res.account || !res.passw) return;
    $("#fm-login-id").prop('value', res.account);
    $("#fm-login-password").prop('value', res.passw);
    setInterval(() => {
        setTimeout(() => {
            let btn = $("div.fm-btn").find("button")[0];
            btn && btn.click();
            // $("div.fm-btn").find("button").trigger("click");
        }, 1000);
    }, 10 * 1000);
}

function pageType() {
    let url = window.location.href;
    let [login, passport, index, fund, oops] = [
        url.indexOf("login.aliexpress.com") > 0,
        url.indexOf("passport.aliexpress.com") > 0,
        url.indexOf("www.aliexpress.com") > 0,
        url.indexOf("fund.aliexpress.com") > 0,
        url.indexOf("alisec.aliexpress.com") > 0
    ];
    if (!login && !passport && !fund && index) {
        return 'index';
    }
    if (passport) {
        return 'login';
    }
    if (fund) {
        return 'fund';
    }
    if (oops) {
        return 'oops';
    }
    return 'loading';
}

// 入口
loopEntry();

$(document).ready(function() {
    let type = pageType();
    // 登录
    // if (type === 'login') chrome.runtime.sendMessage({ type: "auto_fill" }, fill);
    // 解析cookie
    if (type === 'index') {
        try {
            let [, search] = window.location.search.split("?");
            let query = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}');
            console.log(query);
            chrome.runtime.sendMessage({
                type: "cookie",
                data: { platform: query.pplatform, account: query.paccount }
            }, res => {
                console.log(res);
                // if (res) window.location.href = "https://fund.aliexpress.com/fundIndex.htm";
            });
        } catch (err) {
            console.log(err);
        }
    }
});