const timeout = 1 * 60 * 60 * 1000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const rps = [
  "福利多多",
  "团队nice",
  "三餐可口",
  "偏平高效",
  "免费健身",
  "远程面试搞定offer",
  "年终丰厚",
  "多元包容",
  "租房补贴",
  "免费水果",
  "丰盛下午茶",
  "急缺",
  "急缺，来者必富",
  "急缺",
  "北京，上海，深圳，广州",
];

$(document).ready(async () => {
  try {
    const lastUpPostTime = localStorage.getItem("lastUpPostTime") || 0;
    let nowTime = new Date().getTime();
    if (nowTime - lastUpPostTime > timeout) {
      const csrf = $("head > meta:nth-child(15)").attr("content");
      const r_content = rps[parseInt(Math.random() * rps.length)];
      $.post(
        "https://cnodejs.org/5ebfaac52d0afc4087f55f7f/reply",
        { r_content, _csrf: csrf },
        () => {},
        "json"
      );
      localStorage.setItem("lastUpPostTime", nowTime);
    }
  } catch (error) {}
  setTimeout(() => {
    location.href = location.href;
  }, timeout + timeout * Math.random());
});
