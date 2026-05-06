// 默认时区列表
const defaultTimezones = [
    'America/New_York',
    'Europe/London',
    'Asia/Tokyo',
    'Australia/Sydney'
];

// 存储当前时区
let currentTimezones = [...defaultTimezones];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    renderClocks();
    updateClocks();
    setInterval(updateClocks, 1000); // 每秒更新一次
});

// 添加时区
function addTimezone() {
    const input = document.getElementById('timezoneInput');
    const timezone = input.value.trim();

    if (!timezone) {
        alert('请输入时区名称');
        return;
    }

    if (currentTimezones.includes(timezone)) {
        alert('该时区已存在');
        return;
    }

    // 验证时区是否有效
    if (!isValidTimezone(timezone)) {
        alert('无效的时区名称。请使用有效的时区，如 "Asia/Shanghai"');
        return;
    }

    currentTimezones.push(timezone);
    input.value = '';
    renderClocks();
}

// 移除时区
function removeTimezone(index) {
    currentTimezones.splice(index, 1);
    renderClocks();
}

// 重置为默认时区
function resetTimezones() {
    currentTimezones = [...defaultTimezones];
    document.getElementById('timezoneInput').value = '';
    renderClocks();
}

// 验证时区是否有效
function isValidTimezone(timezone) {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
    } catch (ex) {
        return false;
    }
}

// 渲染所有时钟卡片
function renderClocks() {
    const container = document.getElementById('clocksContainer');
    container.innerHTML = '';

    currentTimezones.forEach((timezone, index) => {
        const card = createClockCard(timezone, index);
        container.appendChild(card);
    });
}

// 创建单个时钟卡片
function createClockCard(timezone, index) {
    const card = document.createElement('div');
    card.className = 'clock-card';
    card.id = `clock-${index}`;

    // 获取时区的友好名称
    const timezoneNameDisplay = getTimezoneName(timezone);

    card.innerHTML = `
        <div class="timezone-name">
            <span>${timezoneNameDisplay}</span>
            <button class="remove-btn" onclick="removeTimezone(${index})">×</button>
        </div>
        
        <div class="digital-time" id="time-${index}">00:00:00</div>
        
        <div class="analog-clock" id="analog-${index}">
            <div class="hand hour-hand" id="hour-${index}"></div>
            <div class="hand minute-hand" id="minute-${index}"></div>
            <div class="hand second-hand" id="second-${index}"></div>
            <div class="clock-center"></div>
        </div>
        
        <div class="date-info" id="date-${index}">星期一, 1月 1日</div>
        <div class="utc-offset" id="offset-${index}">UTC+0</div>
    `;

    return card;
}

// 获取时区的显示名称
function getTimezoneName(timezone) {
    const nameMap = {
        'America/New_York': '🗽 纽约',
        'America/Chicago': '🏙️ 芝加哥',
        'America/Denver': '⛰️ 丹佛',
        'America/Los_Angeles': '🌴 洛杉矶',
        'Europe/London': '🇬🇧 伦敦',
        'Europe/Paris': '🗼 巴黎',
        'Europe/Berlin': '🏛️ 柏林',
        'Asia/Shanghai': '🇨🇳 上海',
        'Asia/Hong_Kong': '🏙️ 香港',
        'Asia/Tokyo': '🗾 东京',
        'Asia/Singapore': '🇸🇬 新加坡',
        'Asia/Dubai': '🕌 迪拜',
        'Asia/Kolkata': '🇮🇳 印度',
        'Australia/Sydney': '🦘 悉尼',
        'Pacific/Auckland': '🇳🇿 奥克兰',
        'UTC': '🌐 UTC'
    };

    return nameMap[timezone] || timezone;
}

// 更新所有时钟
function updateClocks() {
    currentTimezones.forEach((timezone, index) => {
        updateClock(timezone, index);
    });
}

// 更新单个时钟
function updateClock(timezone, index) {
    const now = new Date();

    // 获取特定时区的时间
    const formatter = new Intl.DateTimeFormat('zh-CN', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour12: false
    });

    const parts = formatter.formatToParts(now);
    const timeObj = {};
    parts.forEach(part => {
        timeObj[part.type] = part.value;
    });

    // 更新数字时间
    const timeStr = `${timeObj.hour}:${timeObj.minute}:${timeObj.second}`;
    document.getElementById(`time-${index}`).textContent = timeStr;

    // 更新日期
    const dateStr = `${timeObj.weekday}, ${timeObj.month}${timeObj.day}日`;
    document.getElementById(`date-${index}`).textContent = dateStr;

    // 更新UTC偏移量
    const offset = getUTCOffset(timezone);
    document.getElementById(`offset-${index}`).textContent = offset;

    // 更新模拟时钟
    updateAnalogClock(timezone, index);
}

// 计算UTC偏移量
function getUTCOffset(timezone) {
    const now = new Date();
    
    // 创建UTC时间的formatter
    const utcFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'UTC',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    
    // 创建目标时区的formatter
    const tzFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const utcTime = utcFormatter.format(now);
    const tzTime = tzFormatter.format(now);

    // 解析时间
    const [utcH, utcM, utcS] = utcTime.split(':').map(Number);
    const [tzH, tzM, tzS] = tzTime.split(':').map(Number);

    // 计算偏移量（以小时和分钟表示）
    let offsetHours = tzH - utcH;
    let offsetMinutes = tzM - utcM;

    // 处理日期边界
    if (offsetHours > 12) offsetHours -= 24;
    if (offsetHours < -12) offsetHours += 24;

    // 格式化输出
    const sign = offsetHours >= 0 ? '+' : '';
    if (offsetMinutes === 0) {
        return `UTC${sign}${offsetHours}`;
    } else {
        return `UTC${sign}${offsetHours}:${Math.abs(offsetMinutes).toString().padStart(2, '0')}`;
    }
}

// 更新模拟时钟
function updateAnalogClock(timezone, index) {
    const now = new Date();

    // 获取特定时区的小时、分钟、秒
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });

    const parts = formatter.formatToParts(now);
    const timeObj = {};
    parts.forEach(part => {
        timeObj[part.type] = parseInt(part.value, 10);
    });

    const hours = timeObj.hour % 12;
    const minutes = timeObj.minute;
    const seconds = timeObj.second;

    // 计算旋转角度
    const secondDegrees = (seconds / 60) * 360;
    const minuteDegrees = (minutes / 60) * 360 + (seconds / 60) * 6;
    const hourDegrees = (hours / 12) * 360 + (minutes / 60) * 30;

    // 应用旋转
    document.getElementById(`hour-${index}`).style.transform = `rotate(${hourDegrees}deg)`;
    document.getElementById(`minute-${index}`).style.transform = `rotate(${minuteDegrees}deg)`;
    document.getElementById(`second-${index}`).style.transform = `rotate(${secondDegrees}deg)`;
}

// 支持回车键添加时区
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('timezoneInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTimezone();
        }
    });
});