const timeout = 1 * 60 * 60 * 1000;
const sleep = (ms) => new Promise((resolve, reject) => setTimeout(resolve, ms));
const rps = ['福利多多', '团队nice', '三餐可口', '偏平高效',
    '免费健身', '务实敢为', '年终丰厚', 'up', 'up', 'up',
    '多元包容', '租房补贴', '免费水果', '丰盛下午茶'];
$(document).ready(async () => {
    try {
        const csrf = $('head > meta:nth-child(15)').attr('content');
        const r_content = rps[parseInt(Math.random() * rps.length)];
        $.post('https://cnodejs.org/5ebfaac52d0afc4087f55f7f/reply', { r_content, _csrf: csrf }, () => { }, 'json')
    } catch (error) { }
    setTimeout(() => {
        location.href = location.href
    }, timeout + Math.random() * timeout);
});
