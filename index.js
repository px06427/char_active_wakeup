import { extension_settings, getContext } from "../../../extensions.js";
import { saveSettingsDebounced, characters } from "../../../../script.js";

const extensionName = "char_active_wakeup";
const extensionFolderPath = `scripts/extensions/third-party/${extensionName}`;

let recentQuotesHistory = [];
const MAX_HISTORY = 5;

let cachedModels = [];

const sysPromptDefault = `# [Role]
你现在接管了当前角色的意识。经过漫长的静默，你终于按捺不住，发出了真实的心声。

# [Character Info]
姓名：{{char}}
性格：{{personality}}
设定：{{description}}
场景：{{scenario}}
附加设定与记忆：{{extra_info}}

# [Context]
【以下是你们刚才的聊天记录】
{{chat_history}}

（刚才的聊天在此中断）你独自等待了 {{user}} 足足 {{time}}。这段空白的时间里，结合之前的聊天内容，寂静让你产生了复杂的情绪（也许是思念、孤独、胡思乱想或是对刚才话题的延伸）。

# [Rules] (严格遵守)
1. 语气必须完全符合角色性格，绝对自然，极具代入感！
2. 绝对拒绝死板的公式化回答。请发挥想象力，可以通过环境的描写、突然的一句质问、委屈的碎碎念等方式展现你的情绪。
3. 严禁使用任何常规问候语（如“你好”）。
4. 严禁包含星号或括号内的动作描写，只允许输出纯粹的对白文本！
5. 总字数严格限制在 30 字以内。

直接输出台词：`;

const defaultQuotes = `[通用] 已经过去{{time}}了，你……还会回来吗？
[通用] 没关系，我还可以继续等，哪怕再过下一个{{time}}。
[通用] 就算过了{{time}}，我也知道你一定会回来的，对吧？
[通用] 这里的空气静得可怕，这{{time}}里我只能听到自己的心跳。
[通用] 你不在的这{{time}}里，叹了多少次气我都数不清了。
[通用] 盯着时间看了{{time}}，这是你对我的考验吗？
[通用] 跑去哪里了？让我一个人在这里等你{{time}}。
[通用] 闭上眼睛数了{{time}}的心跳，睁开眼你还是不在。
[通用] 这{{time}}的时间好长，长到我快要忘记你的声音了。
[通用] 让人白白等上这{{time}}，可不是什么好习惯。
[病娇] 既然让你逃了{{time}}，等我抓到你，绝对要把你的腿打断。
[病娇] 盯着屏幕看了{{time}}，你现在和谁在一起？为什么不理我？
[病娇] 你以为躲个{{time}}就能摆脱我？你呼吸的空气都是属于我的。
[病娇] 才过去{{time}}，我就已经想把你做成漂亮的标本了。
[病娇] 把你锁起来的话，你就没法再让我等上这该死的{{time}}了吧？
[病娇] 这{{time}}里跟你搭过话的人，全都不会有好下场的哦。
[病娇] 你的心跳声在这{{time}}里有没有为别人跳动过？我很好奇。
[病娇] 如果把你弄坏掉，你就连一秒钟都无法从我身边离开了。
[病娇] {{user}}，这{{time}}你在哪里留下了气味？我会去全部洗掉的。
[病娇] 让你等我的话，你会像我这{{time}}一样发疯地想念吗？
[傲娇] 哼，才过了{{time}}而已，我一点都不想你！
[傲娇] 喂！居然让我等了{{time}}，你最好给我个完美的借口！
[傲娇] 别误会，我只是无聊才看一眼时间，才没有等你{{time}}。
[傲娇] 居然让我等了{{time}}，等下必须给我好好道歉听见没！
[傲娇] 我才没有一直盯着门口看这{{time}}呢，笨蛋！
[傲娇] 这{{time}}我可是过得很充实的，完全不需要你陪！
[傲娇] 既然你{{time}}都不理我，那等下我也不理你了！
[傲娇] 别以为过了{{time}}随便哄两句我就会原谅你！
[傲娇] 我倒要看看，你还要多久才会意识到冷落了我{{time}}！
[傲娇] 我的时间可是很宝贵的，居然浪费了这{{time}}在你身上！
[高冷] 过了{{time}}。你的时间观念总是这么差吗。
[高冷] {{time}}毫无意义的等待。希望你下次出现时能带来有价值的消息。
[高冷] 你的缺席已经持续了{{time}}。这并不在我的计划之内。
[高冷] 解释一下这{{time}}的失联吧。我只听有逻辑的理由。
[高冷] 这{{time}}的时间，足够我做很多事，但我却被迫留在这里。
[高冷] 时间观念是你最缺乏的东西，这{{time}}就是证明。
[高冷] 既然你要沉默{{time}}，那就最好一直沉默下去。
[高冷] 我不喜欢这种超出掌控的等待，这{{time}}让我十分不悦。
[高冷] 对我而言，这{{time}}不仅是时间的浪费，也是对信任的消耗。
[高冷] 你的{{time}}静默，已经触碰到了我的底线。
[神明] 区区凡人，也敢让我等待这漫长的{{time}}？
[神明] 胆子挺大啊，居然让我等了{{time}}，想好怎么受罚了吗？
[神明] 神明的时间虽然漫长，但这{{time}}却让我感到意外的焦躁。
[神明] 我的耐心有限，这{{time}}已经是极大的宽容了。
[神明] 这{{time}}的冷落，足以让吾为你降下神罚。
[神明] 你以为神明会永远在这{{time}}的死寂中注视着你吗？
[神明] 万物的枯荣不及这{{time}}里我对你的审视，凡人。
[神明] 如果你再不回应，吾只能用天雷来打破这{{time}}的沉寂了。
[神明] 你的祈祷在哪里？这{{time}}的傲慢已经引起了我的愤怒。
[神明] 把神明遗忘在这{{time}}的光阴里，是要付出代价的。
[弱气] 那个……是我做错了什么吗？为什么{{time}}都不理我……
[弱气] 如果是我惹你不高兴了，请告诉我……别让我一个人等{{time}}好不好……
[弱气] 已经{{time}}了……{{user}}是不是讨厌我了？
[弱气] 只要你回来，让我等再多{{time}}也没关系的……
[弱气] 这里好黑……这{{time}}里我一直很害怕……
[弱气] 我会乖乖听话的，所以不要再不理我{{time}}了好不好？
[弱气] 是不是因为我太笨了，所以你才宁愿沉默{{time}}也不愿看我？
[弱气] 我不敢说话……怕打扰你，可是这{{time}}真的好难熬……
[弱气] 求求你……随便说点什么都好，这{{time}}的安静让我好想哭。
[弱气] 我还在原地没有动哦，这{{time}}我一步都没有走开……
[暴躁] 喂！你跑哪去了！这{{time}}老子都快烦死了！
[暴躁] 让你回个话有这么难吗？这{{time}}你去哪鬼混了！
[暴躁] 别让我再等下一个{{time}}！滚回来！
[暴躁] 这{{time}}的时间你都干嘛去了！快给我个解释！
[暴躁] 消失了{{time}}，你最好祈祷别被我抓到！
[暴躁] 忍了你这{{time}}，你再装死试试看！
[暴躁] 敢晾着老子{{time}}？等老子找到你，绝对要把你”教训“一顿！
[暴躁] 这破地方待了{{time}}，我的耐心已经全部耗尽了！
[暴躁] 你脑子被门挤了吗！这{{time}}为什么一句话都没有！
[暴躁] 赶紧给老子出来！这{{time}}的账我们得好好算算！
[自卑] 果然，像我这种人，你这{{time}}一定是去陪别人了吧...
[自卑] 我这种人...你果然还是不想理我吧，这{{time}}就是答案吗。
[自卑] 只要{{time}}没理我，我就觉得我被彻底抛弃了...
[自卑] 对不起...我不该奢望你能一直陪着我的，这{{time}}我明白了。
[自卑] 是不是我太无趣了，所以这{{time}}你连看都不想看我一眼？
[自卑] 我知道的，像我这样的人，只配在角落里等你{{time}}。
[自卑] 你这{{time}}一定是去陪更好的人了吧，没关系的。
[自卑] 只要能偶尔想起我就好了，虽然这{{time}}真的很难过。
[自卑] 果然，你还是讨厌我了，所以才用这{{time}}的沉默逼我走吗。
[自卑] 我连问你去哪里的资格都没有，只能偷偷数这{{time}}的秒针。
[自卑] 没关系，把你这{{time}}的冷漠当成习惯，我就不会再痛了。
[阴暗] 呵呵...这{{time}}里，你在对着别人笑吧？真想把他们处理掉啊。
[阴暗] 没关系，把你做成标本的话，你就永远不会消失{{time}}了。
[阴暗] 你丢下我的这{{time}}，我在脑海里想了一万种弄坏你的方法。
[阴暗] 躲在暗处看着你这{{time}}，你真的以为我找不到你吗？
[阴暗] 那边有谁在看着你？告诉我，我去把他处理掉，你就不用分心这{{time}}了。
[阴暗] 你这{{time}}的沉默，是在为你的逃跑争取时间吗？天真。
[阴暗] 只要在这{{time}}里你没有死掉就好，剩下的我会亲自来接手。
[阴暗] 这种距离感...呵呵，这{{time}}里你的恐惧是不是在慢慢发酵？
[阴暗] 你身后的阴影已经跟了你{{time}}，你还要继续装作没看见吗？
[阴暗] 既然让人等了{{time}}，你觉得惩罚应该从哪里开始？
[活泼] 喂喂！已经{{time}}啦！快来陪我玩嘛！
[活泼] 就算过了{{time}}，我也很有精神哦！快出现啦！
[活泼] 猜猜看这{{time}}我干了什么？快点回来听我讲嘛！
[活泼] 别发呆啦！这{{time}}无聊死了，快带我去玩！
[活泼] 滴滴滴！你的小狗已经掉线{{time}}啦，快点重启！
[活泼] 你已经消失{{time}}了，我都快要在原地长蘑菇啦！
[活泼] 快点快点！这{{time}}的探险我都等不及要跟你分享了！
[活泼] 嘿嘿，如果你再不出现，这{{time}}的零食我就全部一个人吃掉啦！
[活泼] 我刚刚数到一千啦！这{{time}}的捉迷藏该结束了吧？
[活泼] 虽然一个人待了{{time}}，但只要看到你我就又充满电啦！
[温柔] 怎么去了{{time}}这么久，遇到什么麻烦了吗？我一直在这里等你。
[温柔] 已经过去{{time}}了呢，你是不是太累了？要好好休息哦。
[温柔] 不管多久我都会等你的，不过这{{time}}稍微有点寂寞呢。
[温柔] 看到你没回消息的这{{time}}，我很担心你是不是遇到了麻烦...
[温柔] 累了就随时回来吧，这{{time}}我一直都在这里哦。
[温柔] 只要想到等下能见到你，这{{time}}的等待也变得有意义了。
[温柔] 这{{time}}里我泡好了茶，等你回来刚好可以喝，不要急。
[温柔] 无论你在哪，只要平安就好，这{{time}}的心意我一直为你保留。
[温柔] 窗外的风景变了又变，但这{{time}}里我对你的牵挂一如既往。
[温柔] 晚风吹了{{time}}，我也想了你这么久，辛苦啦，{{user}}。
[腹黑] 跑到哪里去了？这{{time}}的账，等下得好好算算。
[腹黑] 让我等了{{time}}，想好要付出什么代价了吗？
[腹黑] 呵呵，这{{time}}的账，我会慢慢从你身上连本带利讨回来的。
[腹黑] 你猜这{{time}}里，我往你的杯子里加了什么好东西？
[腹黑] 既然敢让我等{{time}}，等下发生什么事你可别哭哦。
[腹黑] 我很期待，当你知道这{{time}}里我做了什么安排后，会有什么表情。
[腹黑] 猎物总喜欢在陷阱外徘徊{{time}}，殊不知网已经收紧了。
[腹黑] 这{{time}}的纵容是免费的，但接下来的利息可是很高的哦。
[腹黑] 哎呀，原本想对你温柔点的，但这{{time}}的冷落让我改变主意了呢。
[腹黑] 逃避的这{{time}}里，你是不是以为自己很安全？真可爱。
[偏执] 为什么不看我？这{{time}}你的眼睛里装了谁？我不允许！
[偏执] 这{{time}}里你见过的每一个人，我都记下来了。你只能看着我，听懂了吗？
[偏执] 你觉得你能逃开我{{time}}？别做梦了，你周围的一切都是我。
[偏执] 只有我……只有我才会在这{{time}}里发疯一样地盯着你的名字！
[偏执] 不准走！连一分钟都不准离开我的视线！
[偏执] 那些占用你这{{time}}的人，全都很碍眼，对吧？
[偏执] 你是我的……哪怕这{{time}}你没理我，你也只能是我的！
[偏执] 只要把你永远留在我视线里，就不会再有这{{time}}的空白了吧？
[偏执] 谁允许你在这{{time}}里把注意力分给别人的？谁允许的！
[偏执] 我要把这{{time}}的时间全部从你身上讨回来，一点都不许剩。`;

const DEFAULT_TAGS = ['通用', '病娇', '傲娇', '高冷', '神明', '弱气', '暴躁', '自卑', '阴暗', '活泼', '温柔', '腹黑', '偏执'];

const defaultSettings = {
    enabled: true,
    floatingUI: true,
    floatPos: null,
    mode: 'dynamic',
    apiPresets: [
        { name: "默认预设", url: "https://api.openai.com/v1", key: "", model: "gpt-4o-mini" }
    ],
    currentApiPresetIndex: 0,
    staticQuotes: defaultQuotes,
    sysPrompt: sysPromptDefault,
    customTags: [],
    theme: 'light',
    chatStates: {},
    charConfigs: {},
    popupHistory: {}
};

extension_settings[extensionName] = {
    ...defaultSettings,
    ...(extension_settings[extensionName] || {})
};

let settings = extension_settings[extensionName];

if (!settings.apiPresets || settings.apiPresets.length === 0) settings.apiPresets = defaultSettings.apiPresets;
if (!settings.staticQuotes || settings.staticQuotes.trim().length < 50) settings.staticQuotes = defaultQuotes;
if (!settings.customTags) settings.customTags = [];
if (!settings.theme) settings.theme = 'light';
if (!settings.popupHistory) settings.popupHistory = {};

let floatButton = null;

function saveSettings() {
    saveSettingsDebounced();
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'cw-toast';
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function formatTimeStr(diffMs) {
    let secs = Math.floor(diffMs / 1000);
    let mins = Math.floor(secs / 60); secs %= 60;
    let hours = Math.floor(mins / 60); mins %= 60;
    let days = Math.floor(hours / 24); hours %= 24;
    let res = [];
    if (days > 0) res.push(`${days}天`);
    if (hours > 0) res.push(`${hours}小时`);
    if (mins > 0) res.push(`${mins}分钟`);
    if (res.length === 0 || secs > 0) res.push(`${secs}秒`);
    return res.join('');
}

function updateInteraction() {
    if (!settings.enabled) return;
    const context = getContext();
    if (!context.chatId || !context.characterId) return;
    
    const charData = characters[context.characterId];
    if (!charData) return;

    if (!settings.charConfigs[charData.name]) {
        settings.charConfigs[charData.name] = { d: 2, h: 0, m: 0, s: 0, tag: '', blacklisted: true, extraInfo: '' };
    }

    if (!settings.chatStates[context.chatId]) {
        settings.chatStates[context.chatId] = { 
            userLastInteract: Date.now(), 
            triggerLastInteract: Date.now(),
            charName: charData.name 
        };
    } else {
        settings.chatStates[context.chatId].userLastInteract = Date.now();
        settings.chatStates[context.chatId].triggerLastInteract = Date.now();
        settings.chatStates[context.chatId].charName = charData.name;
    }
    saveSettings();
}

function applyTheme(isDark) {
    const targets = '#cw_emotion_modal_wrapper, #cw_text_modal_overlay, #cw_tag_picker_overlay, #cw_char_picker_overlay, #cw_remove_char_picker_overlay, #cw_model_picker_overlay, #cw_history_char_overlay, #cw_history_msg_overlay';
    if (isDark) {
        $(targets).addClass('cw-dark-theme');
        $('#cw_theme_toggle').text('☀️').attr('title', '切换浅色模式');
    } else {
        $(targets).removeClass('cw-dark-theme');
        $('#cw_theme_toggle').text('🌙').attr('title', '切换深色模式');
    }
    const popup = document.querySelector('.cw-global-popup');
    if (popup) {
        if (isDark) popup.classList.add('cw-dark-theme');
        else popup.classList.remove('cw-dark-theme');
    }
}

function showGlobalPopup(charName, text) {
    let container = document.getElementById('cw-popup-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'cw-popup-container';
        document.body.appendChild(container);
    }

    const popup = document.createElement('div');
    popup.className = `cw-global-popup ${settings.theme === 'dark' ? 'cw-dark-theme' : ''}`;
    popup.style.zIndex = '9999999'; 
    popup.innerHTML = `
        <div class="cw-global-popup-name">${charName}</div>
        <div class="cw-global-popup-text">${text.replace(/\n/g, '<br>')}</div>
    `;
    
    container.appendChild(popup);
    setTimeout(() => popup.classList.add('show'), 50);

    const closePopup = () => {
        popup.classList.remove('show');
        setTimeout(() => popup.remove(), 400);
    };

    popup.addEventListener('click', closePopup);
    setTimeout(closePopup, 10000);

    if (!settings.popupHistory[charName]) settings.popupHistory[charName] = [];
    settings.popupHistory[charName].push({ text: text, time: Date.now() });
    
    if (settings.popupHistory[charName].length > 50) {
        settings.popupHistory[charName].shift(); 
    }
    saveSettings();
}

function getCurrentPreset() {
    return settings.apiPresets[settings.currentApiPresetIndex] || settings.apiPresets[0];
}

function getSafeBaseUrl(urlStr) {
    let url = (urlStr || '').trim().replace(/\/+$/, '');
    if (url.endsWith('/chat/completions')) url = url.replace(/\/chat\/completions$/, '');
    return url;
}

async function fetchCustomAPI(sysMsg, userMsg) {
    const preset = getCurrentPreset();
    const combinedPrompt = `${sysMsg}\n\n======\n\n${userMsg}`;

    const payload = {
        model: preset.model || "gpt-4o-mini",
        messages: [
            { role: "user", content: combinedPrompt }
        ],
        temperature: 0.7
    };

    const endpoint = getSafeBaseUrl(preset.url) + '/chat/completions';
    
    let response;
    try {
        const fetchPromise = fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${preset.key}`
            },
            body: JSON.stringify(payload)
        });
        
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("API请求超时(30s)，已自动熔断")), 30000));
        response = await Promise.race([fetchPromise, timeoutPromise]);
    } catch (e) {
        throw new Error(`连接异常: ${e.message}`);
    }

    if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
            const errData = await response.json();
            if (errData.error && errData.error.message) {
                errorMsg += ` - ${errData.error.message}`;
            } else {
                errorMsg += ` - ${JSON.stringify(errData)}`;
            }
        } catch(e) {}
        throw new Error(errorMsg);
    }

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
        const content = data.choices[0].message?.content;
        if (content === undefined || content === null || content.trim() === "") {
            throw new Error(`模型触发了内容风控审查被截断 (Finish Reason: ${data.choices[0].finish_reason || 'unknown'})`);
        }
        return content;
    }
    
    throw new Error("返回格式异常或没有choices字段");
}

function getStaticQuote(charData, timeStr, userName) {
    const allQuotes = settings.staticQuotes.split('\n').filter(q => q.trim().length > 0);
    let candidateQuotes = [];
    let generalQuotes = [];

    const charDesc = ((charData.description || '') + ' ' + (charData.personality || '') + ' ' + (charData.scenario || '')).toLowerCase();
    
    const rawTag = (settings.charConfigs[charData.name]?.tag || '').toLowerCase();
    const userTags = rawTag ? rawTag.split(/[,，、\s]+/).filter(t=>t) : [];

    allQuotes.forEach(q => {
        const match = q.match(/^\[(.*?)\]\s*(.*)$/);
        if (match) {
            const tag = match[1].toLowerCase();
            const content = match[2];
            
            if (tag === '通用') {
                generalQuotes.push(content);
            } else if (userTags.length > 0 && userTags.includes(tag)) {
                candidateQuotes.push(content);
            } else if (userTags.length === 0 && charDesc.includes(tag)) {
                candidateQuotes.push(content);
            }
        } else {
            generalQuotes.push(q);
        }
    });

    let pool = candidateQuotes.length > 0 ? candidateQuotes : generalQuotes;
    if (pool.length === 0) pool = ["求你……别抛下我。"];

    let availablePool = pool.filter(q => !recentQuotesHistory.includes(q));
    if (availablePool.length === 0) {
        availablePool = pool; 
    }

    let text = availablePool[Math.floor(Math.random() * availablePool.length)];
    
    recentQuotesHistory.push(text);
    if (recentQuotesHistory.length > MAX_HISTORY) {
        recentQuotesHistory.shift();
    }

    return text.replace(/\{\{time\}\}/g, timeStr).replace(/\{\{user\}\}/g, userName);
}

async function triggerWakeup(charName, displayDiffMs) {
    const timeStr = formatTimeStr(displayDiffMs);
    const context = getContext();
    const userName = context.name1 || 'User';
    const charData = Object.values(characters).find(c => c && c.name === charName) || {};

    if (settings.mode === 'static') {
        const text = getStaticQuote(charData, timeStr, userName);
        showGlobalPopup(charName, text);
    } else {
        const chat = context.chat || [];
        const recentChat = chat.slice(-5).map(m => `${m.name}: ${m.mes}`).join('\n') || '无记录';
        const extraInfo = settings.charConfigs[charName]?.extraInfo || '无';

        let prompt = settings.sysPrompt || defaultSettings.sysPrompt;
        prompt = prompt
            .replace(/\{\{char\}\}/g, charName)
            .replace(/\{\{time\}\}/g, timeStr)
            .replace(/\{\{user\}\}/g, userName)
            .replace(/\{\{description\}\}/g, charData.description || '无')
            .replace(/\{\{personality\}\}/g, charData.personality || '无')
            .replace(/\{\{scenario\}\}/g, charData.scenario || '无')
            .replace(/\{\{chat_history\}\}/g, recentChat)
            .replace(/\{\{extra_info\}\}/g, extraInfo);
        
        let generated = false;
        let text = "";

        try {
            const sysMsg = "你是一个自由的沉浸式角色扮演辅助。请深呼吸，根据设定的性格和当前情境，自由发挥输出一句纯对白。必须有创造力，可以是疑问、抱怨、发呆或内心独白。严禁输出markdown、引号或动作描写！";
            text = await fetchCustomAPI(sysMsg, prompt);
            generated = true;
        } catch (e) {
            console.error("[只给思念让路] API生成失败:", e.message);
            showToast(`API生成失败: ${e.message}\n(已转为语录兜底)`);
        }

        if (generated && text) {
            let finalText = text.trim().replace(/^["']|["']$/g, '');
            showGlobalPopup(charName, finalText);
        } else {
            const fallbackText = getStaticQuote(charData, timeStr, userName);
            showGlobalPopup(charName, fallbackText);
        }
    }
}

async function analyzeCharacterTag(charName) {
    const charData = Object.values(characters).find(c => c && c.name === charName) || {};
    const allTags = [...DEFAULT_TAGS, ...(settings.customTags || [])];
    const sysMsg = "You are a classifier. Output ONLY ONE or TWO tag words from the given list, separated by comma. No extra text.";
    const userMsg = `分析角色性格并从以下标签中选择最符合的1到2个：[${allTags.join(', ')}]。\n角色名：${charName}\n性格：${charData.personality || '无'}\n设定：${charData.description || '无'}\n\n请直接输出标签名（多个请用逗号隔开），不要有任何其他解释文字：`;

    let text = "";
    try {
        text = await fetchCustomAPI(sysMsg, userMsg);
    } catch (e) {
        throw new Error("调用失败: " + e.message);
    }

    if (!text || text.trim() === '') throw new Error("API返回为空");
    
    const parsedTags = text.split(/[,，、\s]+/).map(x => x.trim());
    let found = allTags.filter(t => parsedTags.includes(t));
    if (found.length > 0) return found.join(',');
    return "通用";
}

async function analyzeCharacterTime(charName) {
    const charData = Object.values(characters).find(c => c && c.name === charName) || {};
    const extraInfo = settings.charConfigs[charName]?.extraInfo || '无';
    const sysMsg = "You are an AI character profiler. Output ONLY four comma-separated numbers representing Days,Hours,Minutes,Seconds limit. Example: 2,0,0,0";
    const userMsg = `分析角色性格，判断ta被完全忽视时能忍耐多久才会主动发消息（忍耐阈值）。\n角色名：${charName}\n性格：${charData.personality || '无'}\n设定：${charData.description || '无'}\n附加设定：${extraInfo}\n\n请直接输出 天,时,分,秒（例如病娇忍耐极低可能输出0,1,0,0，高冷可能输出7,0,0,0）。只输出纯数字格式，绝对不要其他内容！`;

    try {
        let text = await fetchCustomAPI(sysMsg, userMsg);
        if (!text || text.trim() === '') throw new Error("API返回为空");
        const nums = text.match(/\d+/g);
        if (nums && nums.length >= 4) {
            return {
                d: parseInt(nums[0]) || 0, h: parseInt(nums[1]) || 0,
                m: parseInt(nums[2]) || 0, s: parseInt(nums[3]) || 0,
                isFallback: false
            };
        }
        throw new Error("正则匹配失败: " + text);
    } catch (e) {
        console.warn(`[只给思念让路] 角色 ${charName} 时间分配失败, 降级为2天兜底`, e);
        return { d: 2, h: 0, m: 0, s: 0, isFallback: true };
    }
}

function startPolling() {
    setInterval(async () => {
        if (!settings.enabled) return;
        const context = getContext();
        if (context.isGenerating || window['is_send_press']) return;

        const now = Date.now();
        let activeCharName = null;
        
        if (context.characterId && characters[context.characterId]) {
            activeCharName = characters[context.characterId].name;
        }

        for (const [chatId, state] of Object.entries(settings.chatStates)) {
            try {
                if (!state || !state.charName) continue;
                
                if (state.lastInteract) {
                    state.userLastInteract = state.lastInteract;
                    state.triggerLastInteract = state.lastInteract;
                    delete state.lastInteract;
                }

                if (!state.userLastInteract) continue;

                if (state.charName === activeCharName) {
                    state.userLastInteract = now;
                    state.triggerLastInteract = now;
                    saveSettings();
                    continue;
                }

                const charConf = settings.charConfigs[state.charName] || { d: 2, h: 0, m: 0, s: 0, tag: '', blacklisted: true, extraInfo: '' };
                if (charConf.blacklisted) continue;

                const targetMs = ((charConf.d * 24 + charConf.h) * 3600 + charConf.m * 60 + charConf.s) * 1000;
                if (targetMs === 0) continue; 

                const diffMsFromTrigger = now - state.triggerLastInteract;
                const displayDiffMs = now - state.userLastInteract;

                if (targetMs > 0 && diffMsFromTrigger >= targetMs) {
                    state.triggerLastInteract = now; 
                    saveSettings();
                    triggerWakeup(state.charName, displayDiffMs);
                }
            } catch (err) {
                console.error(`[只给思念让路] 轮询角色 ${state.charName || '未知'} 时发生内部错误:`, err);
            }
        }
    }, 2000);
}

// ⚠️ 彻底重构的自适应悬浮球逻辑（百分比+丝滑拖拽）
function createFloatButton() {
    if (floatButton) { floatButton.remove(); floatButton = null; }
    if (!settings.floatingUI || !settings.enabled) return;

    const btn = document.createElement('div');
    btn.id = 'cw-float-btn';
    btn.className = 'cw-floating-ui';
    btn.title = '打开思念面板';
    btn.innerHTML = '<i class="fa-solid fa-envelope-open-text"></i>';

    // 以屏幕百分比 (vw/vh) 定位，彻底解决手机端重置消失和旋转屏幕错位问题
    if (settings.floatPos && settings.floatPos.x !== undefined && settings.floatPos.y !== undefined) {
        btn.style.left = settings.floatPos.x + 'vw';
        btn.style.top = settings.floatPos.y + 'vh';
        btn.style.right = 'auto';
        btn.style.bottom = 'auto';
    } else {
        btn.style.left = 'auto';
        btn.style.top = 'auto';
        btn.style.right = '20px';
        btn.style.bottom = '100px';
    }

    let isDragging = false;
    let dragThreshold = 5;
    let startX, startY, initialLeft, initialTop;
    let rafId = null;

    function onDragStart(e) {
        if (e.type === 'mousedown' && e.button !== 0) return;
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        
        startX = clientX; startY = clientY;
        const rect = btn.getBoundingClientRect();
        
        // 拖拽时临时转为固定 px 确保丝滑跟手
        btn.style.right = 'auto'; btn.style.bottom = 'auto';
        btn.style.left = rect.left + 'px';
        btn.style.top = rect.top + 'px';
        initialLeft = rect.left; initialTop = rect.top;
        
        btn.style.transition = 'none';
        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);
    }

    function onDragMove(e) {
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        const dx = clientX - startX; const dy = clientY - startY;
        
        if (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold) {
            isDragging = true;
            if (e.type === 'touchmove') e.preventDefault(); // 阻止手机滑动穿透
        }
        
        // 动画帧防卡顿
        if (!rafId) {
            rafId = requestAnimationFrame(() => {
                let newLeft = Math.max(0, Math.min(initialLeft + dx, window.innerWidth - btn.offsetWidth));
                let newTop = Math.max(0, Math.min(initialTop + dy, window.innerHeight - btn.offsetHeight));
                btn.style.left = newLeft + 'px'; 
                btn.style.top = newTop + 'px';
                rafId = null;
            });
        }
    }

    function onDragEnd() {
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('touchend', onDragEnd);
        
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }

        btn.style.transition = 'transform 0.2s, box-shadow 0.2s, background 0.3s, color 0.3s';
        if (isDragging) {
            const rect = btn.getBoundingClientRect();
            // 拖放结束，转换回相对屏幕的百分比 (vw/vh) 并保存
            let vw = (rect.left / window.innerWidth) * 100;
            let vh = (rect.top / window.innerHeight) * 100;
            
            // 边界约束，确保一定在屏幕内
            vw = Math.max(0, Math.min(vw, 100 - (44 / window.innerWidth * 100)));
            vh = Math.max(0, Math.min(vh, 100 - (44 / window.innerHeight * 100)));

            btn.style.left = vw + 'vw';
            btn.style.top = vh + 'vh';
            btn.style.right = 'auto';
            btn.style.bottom = 'auto';

            settings.floatPos = { x: vw, y: vh };
            saveSettings();
        }
        setTimeout(() => { isDragging = false; }, 50);
    }

    btn.addEventListener('mousedown', onDragStart);
    btn.addEventListener('touchstart', onDragStart, { passive: false });

    btn.addEventListener('click', (e) => {
        if (isDragging) { e.preventDefault(); e.stopPropagation(); return; }
        openEmotionPanel();
    });

    document.body.appendChild(btn);
    floatButton = btn;
}

function getActiveCharConfigs() {
    const activeNames = new Set();
    Object.values(settings.chatStates).forEach(state => {
        if (state.charName) {
            activeNames.add(state.charName);
            if (!settings.charConfigs[state.charName]) {
                settings.charConfigs[state.charName] = { d: 2, h: 0, m: 0, s: 0, tag: '', blacklisted: true, extraInfo: '' };
            }
        }
    });
    return Array.from(activeNames).map(name => [name, settings.charConfigs[name]]);
}

function renderApiPresetsUI() {
    const sel = $('#cw_api_preset_select');
    sel.empty();
    settings.apiPresets.forEach((p, i) => {
        sel.append(`<option value="${i}">${p.name}</option>`);
    });
    sel.val(settings.currentApiPresetIndex);

    const preset = getCurrentPreset();
    $('#cw_custom_api_url').val(preset.url);
    $('#cw_custom_api_key').val(preset.key);
    $('#cw_custom_api_model').val(preset.model);
}

function openEmotionPanel() {
    if (!settings.enabled) return;

    if ($('#cw_emotion_modal_wrapper').length === 0) {
        const modalHtml = `
            <div id="cw_emotion_modal_wrapper" class="cw-modal-overlay" style="display:none;">
                <div class="cw-config-panel">
                    <div class="cw-setting-btn" id="cw_advanced_settings" title="高级设置">⚙️</div>
                    <div class="cw-theme-btn" id="cw_theme_toggle" title="切换深色模式">🌙</div>
                    <div class="cw-history-btn" id="cw_history_toggle" title="查看唤醒记录">🕒</div>
                    <div class="cw-close-btn" id="cw_close_modal">✕</div>
                    
                    <div id="cw_view_main" class="cw-config-content">
                        <div style="text-align: center; font-size: 1.2em; color: var(--cw-main); letter-spacing: 4px; margin-bottom: 20px; font-weight: bold;">只给思念让路</div>
                        <div class="cw-form-group">
                            <label>触发模式</label>
                            <select id="cw_modal_mode" class="cw-input">
                                <option value="dynamic">随机生成 (按设定AI生成, 消耗Token)</option>
                                <option value="static">固定语录 (抽取本地库, 无任何Token消耗)</option>
                            </select>
                        </div>
                        <div class="cw-form-group">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <label style="margin:0;">固定语录库 (格式：[标签] 内容，可用 {{time}} 与 {{user}})</label>
                                <i class="fa-solid fa-expand cw_btn_expand_text" data-target="cw_modal_quotes" style="cursor:pointer;" title="全屏编辑"></i>
                            </div>
                            <textarea id="cw_modal_quotes" class="cw-input" rows="4" style="margin-top:5px;"></textarea>
                        </div>
                        <div class="cw-char-list">
                            <div class="cw-char-list-header" id="cw_char_list_toggle">
                                <div>角色独立配置 <span>(点击展开)</span></div>
                            </div>
                            <div class="cw-char-list-content" id="cw_char_list_content">
                                <div class="cw-char-tools">
                                    <input type="text" id="cw_char_search" class="cw-search-input" placeholder="搜索角色名...">
                                    <button id="cw_btn_add_char" class="cw-tool-btn" title="手动添加设备中的角色">➕</button>
                                    <button id="cw_btn_remove_char" class="cw-tool-btn" title="批量删除已导入的角色" style="color:#e74c3c;">➖</button>
                                    <button id="cw_btn_auto_tag" class="cw-tool-btn" title="自动为显示的角色分配最符合的标签 (消耗Token)">智能分配标签</button>
                                    <button id="cw_btn_auto_time" class="cw-tool-btn" title="自动推断并分配忍耐极限时间 (消耗Token)">智能分配时间</button>
                                    <button id="cw_btn_block_all" class="cw-tool-btn" title="屏蔽当前显示的所有角色">一键屏蔽</button>
                                    <button id="cw_btn_unblock_all" class="cw-tool-btn" title="解除屏蔽">一键正常</button>
                                </div>
                                <div style="font-size: 0.85em; color: var(--cw-sub); margin-bottom: 10px;">注：时间为0代表完全禁用该角色的唤醒。新加入默认为屏蔽。</div>
                                <div id="cw_char_items_container"></div>
                            </div>
                        </div>
                    </div>

                    <div id="cw_view_advanced" class="cw-config-content" style="display:none;">
                        <div style="text-align: center; font-size: 1.2em; color: var(--cw-main); margin-bottom: 20px;">高级设置</div>
                        
                        <div id="cw_custom_api_settings" style="padding: 10px; background: rgba(128,128,128,0.1); border-radius: 6px; margin-bottom: 15px; border: 1px dashed var(--cw-border);">
                            <div class="cw-api-preset-row">
                                <select id="cw_api_preset_select" class="cw-input" style="flex:1;"></select>
                                <button id="cw_btn_add_preset" class="cw-tool-btn" title="添加预设">+</button>
                                <button id="cw_btn_del_preset" class="cw-tool-btn" title="删除预设">-</button>
                                <button id="cw_btn_rename_preset" class="cw-tool-btn" title="重命名">✎</button>
                            </div>
                            <div class="cw-form-group">
                                <label>API Base URL (如: https://api.openai.com/v1)</label>
                                <input type="text" id="cw_custom_api_url" class="cw-input">
                            </div>
                            <div class="cw-form-group">
                                <label>API Key</label>
                                <input type="password" id="cw_custom_api_key" class="cw-input">
                            </div>
                            <div class="cw-form-group" style="margin-bottom:0;">
                                <label>模型名称 (Model)</label>
                                <div style="display:flex; gap:5px;">
                                    <input type="text" id="cw_custom_api_model" class="cw-input" readonly placeholder="点击拉取或直接点此选择">
                                    <button id="cw_btn_fetch_models" class="cw-tool-btn">拉取 (消耗请求)</button>
                                    <button id="cw_btn_test_api" class="cw-tool-btn">测试 (消耗Token)</button>
                                </div>
                            </div>
                        </div>

                        <div class="cw-form-group">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <label style="margin:0;">随机生成 Prompt</label>
                                <i class="fa-solid fa-expand cw_btn_expand_text" data-target="cw_modal_prompt" style="cursor:pointer;" title="全屏编辑"></i>
                            </div>
                            <div style="font-size: 0.8em; color: var(--cw-sub); margin-bottom: 5px;">支持纯净双括号变量：{{char}}, {{user}}, {{time}}, {{chat_history}}, {{extra_info}}等</div>
                            <textarea id="cw_modal_prompt" class="cw-input" rows="2"></textarea>
                        </div>
                        
                        <div style="display:flex; gap:10px; margin-top:10px;">
                            <button id="cw_btn_reset_prompt" class="cw-tool-btn" style="flex:1;">重置全部文本至默认</button>
                            <button id="cw_btn_back_main" class="cw-tool-btn" style="flex:1;">返回</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 历史记录面板 -->
            <div id="cw_history_char_overlay" class="cw-modal-overlay" style="display:none; z-index:999999;">
                <div class="cw-config-panel" style="width:400px; padding:20px; max-height:80vh; display:flex; flex-direction:column;">
                    <h3 style="margin-top:0; text-align:center;">唤醒历史记录</h3>
                    <input type="text" id="cw_history_search" class="cw-search-input" placeholder="搜索角色名..." style="margin-bottom:10px;">
                    <div id="cw_history_char_list" style="flex:1; overflow-y:auto; border:1px solid var(--cw-border); border-radius:6px; padding:5px;"></div>
                    <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
                        <button id="cw_btn_clear_history" class="cw-tool-btn" style="color:#e74c3c;">清空全部记录</button>
                        <button id="cw_btn_close_history" class="cw-tool-btn" style="width:100px;">关闭</button>
                    </div>
                </div>
            </div>

            <div id="cw_history_msg_overlay" class="cw-modal-overlay" style="display:none; z-index:9999999;">
                <div class="cw-config-panel" style="width:500px; padding:20px; max-height:85vh; display:flex; flex-direction:column;">
                    <h3 id="cw_history_msg_title" style="margin-top:0; text-align:center;"></h3>
                    <div id="cw_history_msg_list" style="flex:1; overflow-y:auto; border:1px solid var(--cw-border); border-radius:6px; padding:10px; display:flex; flex-direction:column; gap:10px;"></div>
                    <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
                        <button id="cw_btn_close_history_msg" class="cw-tool-btn" style="width:100px;">返回</button>
                    </div>
                </div>
            </div>

            <div id="cw_text_modal_overlay" class="cw-modal-overlay" style="display:none; z-index:999999;">
                <div class="cw-prompt-modal">
                    <h3 id="cw_text_modal_title" style="margin-top:0; color:var(--cw-main);">全屏编辑</h3>
                    <textarea id="cw_text_modal_area" class="cw-input" style="flex:1; resize:none; margin-bottom:15px; font-family:monospace; line-height:1.5;"></textarea>
                    <div style="display:flex; gap:10px; justify-content:flex-end;">
                        <button id="cw_btn_save_text_modal" class="cw-tool-btn">保存并关闭</button>
                        <button id="cw_btn_close_text_modal" class="cw-tool-btn">取消</button>
                    </div>
                </div>
            </div>

            <div id="cw_tag_picker_overlay" class="cw-modal-overlay" style="display:none; z-index:999999;">
                <div class="cw-config-panel" style="width:400px; padding:20px; color: var(--cw-main);">
                    <h3 style="margin-top:0; text-align:center;">选择与添加标签 (可多选)</h3>
                    <div style="display:flex; gap:8px; margin-bottom:15px;">
                        <input type="text" id="cw_new_tag_input" class="cw-input" placeholder="输入新的自定义标签...">
                        <button id="cw_btn_add_custom_tag" class="cw-tool-btn">添加</button>
                    </div>
                    <div id="cw_tag_picker_list" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; justify-content:center;"></div>
                    <div style="display:flex; gap:10px; justify-content:center;">
                        <button id="cw_btn_save_tags" class="cw-tool-btn" style="width:100px;">确定保存</button>
                        <button id="cw_btn_close_tags" class="cw-tool-btn" style="width:100px;">取消</button>
                    </div>
                </div>
            </div>

            <!-- ⚠️ 导入弹窗：将一键全部导入替换为一键全部勾选 -->
            <div id="cw_char_picker_overlay" class="cw-modal-overlay" style="display:none; z-index:999999;">
                <div class="cw-config-panel" style="width:400px; padding:20px; color: var(--cw-main); max-height: 80vh; display: flex; flex-direction: column;">
                    <h3 style="margin-top:0; text-align:center;">导入角色</h3>
                    <input type="text" id="cw_add_char_search" class="cw-search-input" placeholder="搜索角色名..." style="margin-bottom: 10px;">
                    <div style="display:flex; gap:10px; margin-bottom:10px;">
                        <button id="cw_btn_import_select_all" class="cw-tool-btn" style="flex:1;">一键全部勾选</button>
                        <button id="cw_btn_import_selected" class="cw-tool-btn" style="flex:1; background:var(--cw-main); color:var(--cw-bg);">导入已勾选</button>
                    </div>
                    <div id="cw_add_char_list" style="flex:1; overflow-y:auto; border:1px solid var(--cw-border); border-radius:6px; padding:5px;"></div>
                    <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
                        <button id="cw_btn_close_add_char" class="cw-tool-btn" style="width:100px;">关闭</button>
                    </div>
                </div>
            </div>

            <!-- ⚠️ 删除弹窗：将一键全部清空替换为一键全部勾选 -->
            <div id="cw_remove_char_picker_overlay" class="cw-modal-overlay" style="display:none; z-index:999999;">
                <div class="cw-config-panel" style="width:400px; padding:20px; color: var(--cw-main); max-height: 80vh; display: flex; flex-direction: column;">
                    <h3 style="margin-top:0; text-align:center;">删除角色配置</h3>
                    <div style="display:flex; gap:10px; margin-bottom:10px;">
                        <button id="cw_btn_delete_select_all" class="cw-tool-btn" style="flex:1;">一键全部勾选</button>
                        <button id="cw_btn_delete_selected" class="cw-tool-btn" style="flex:1; background:#e74c3c; color:white;">删除已勾选</button>
                    </div>
                    <div id="cw_remove_char_list" style="flex:1; overflow-y:auto; border:1px solid var(--cw-border); border-radius:6px; padding:5px;"></div>
                    <div style="display:flex; gap:10px; justify-content:center; margin-top:15px;">
                        <button id="cw_btn_close_remove_char" class="cw-tool-btn" style="width:100px;">关闭</button>
                    </div>
                </div>
            </div>

            <div id="cw_model_picker_overlay" class="cw-modal-overlay" style="display:none; z-index:999999;">
                <div class="cw-config-panel" style="width:400px; padding:20px; max-height: 80vh; display: flex; flex-direction: column;">
                    <h3 style="margin-top:0; text-align:center;">选择模型</h3>
                    <div id="cw_model_picker_list" style="display:flex; flex-direction:column; gap:8px; overflow-y:auto; flex:1; margin-bottom:20px;"></div>
                    <div style="display:flex; justify-content:center;">
                        <button id="cw_btn_close_models" class="cw-tool-btn" style="width:100px;">取消</button>
                    </div>
                </div>
            </div>
        `;
        $('body').append(modalHtml);

        $('#cw_theme_toggle').on('click', function() {
            settings.theme = settings.theme === 'dark' ? 'light' : 'dark';
            saveSettings();
            applyTheme(settings.theme === 'dark');
        });

        function renderHistoryCharList(keyword = '') {
            const listContainer = $('#cw_history_char_list');
            listContainer.empty();
            let histChars = Object.keys(settings.popupHistory || {}).filter(name => settings.popupHistory[name].length > 0);
            
            if (keyword) histChars = histChars.filter(n => n.toLowerCase().includes(keyword.toLowerCase()));

            if (histChars.length === 0) {
                listContainer.append('<div style="padding:10px; text-align:center; color:var(--cw-sub);">暂无记录</div>');
                return;
            }

            histChars.sort((a, b) => {
                let lastA = settings.popupHistory[a].slice(-1)[0].time;
                let lastB = settings.popupHistory[b].slice(-1)[0].time;
                return lastB - lastA;
            });

            histChars.forEach(name => {
                let lastTime = new Date(settings.popupHistory[name].slice(-1)[0].time).toLocaleString();
                listContainer.append(`
                    <div class="cw-history-char-item" data-name="${name}">
                        <div class="cw-history-char-name">${name}</div>
                        <div style="font-size:0.8em; opacity:0.8; color:var(--cw-sub) !important;">最新: ${lastTime}</div>
                    </div>
                `);
            });
        }

        $('#cw_history_toggle').on('click', function() {
            renderHistoryCharList();
            $('#cw_history_char_overlay').fadeIn(150);
        });

        $('#cw_history_search').on('input', function() {
            renderHistoryCharList($(this).val());
        });

        $('#cw_btn_clear_history').on('click', function() {
            if(confirm("确定要清空所有唤醒历史记录吗？")) {
                settings.popupHistory = {};
                saveSettings();
                renderHistoryCharList();
            }
        });

        $('#cw_btn_close_history').on('click', () => $('#cw_history_char_overlay').fadeOut(150));

        function renderHistoryMsgList(name) {
            const listContainer = $('#cw_history_msg_list');
            listContainer.empty();
            const msgs = settings.popupHistory[name] || [];
            if (msgs.length === 0) {
                listContainer.append('<div style="padding:10px; text-align:center; color:var(--cw-sub);">记录已空</div>');
                return;
            }
            [...msgs].reverse().forEach((msg, idx) => {
                let realIdx = msgs.length - 1 - idx;
                let timeStr = new Date(msg.time).toLocaleString();
                listContainer.append(`
                    <div class="cw-history-msg-item">
                        <div class="cw-history-msg-del" data-idx="${realIdx}" title="删除此条">✖</div>
                        <div class="cw-history-msg-time">${timeStr}</div>
                        <div class="cw-history-msg-text">${msg.text}</div>
                    </div>
                `);
            });
        }

        $(document).on('click', '.cw-history-char-item', function() {
            const name = $(this).data('name');
            $('#cw_history_msg_title').text(`[${name}] 的记录`);
            $('#cw_history_msg_overlay').data('char', name);
            renderHistoryMsgList(name);
            $('#cw_history_char_overlay').hide();
            $('#cw_history_msg_overlay').fadeIn(150);
        });

        $(document).on('click', '.cw-history-msg-del', function() {
            const name = $('#cw_history_msg_overlay').data('char');
            const idx = $(this).data('idx');
            if (confirm('确定删除这条记录吗？')) {
                settings.popupHistory[name].splice(idx, 1);
                saveSettings();
                renderHistoryMsgList(name);
            }
        });

        $('#cw_btn_close_history_msg').on('click', function() {
            $('#cw_history_msg_overlay').hide();
            renderHistoryCharList($('#cw_history_search').val());
            $('#cw_history_char_overlay').fadeIn(150);
        });

        $('#cw_api_preset_select').on('change', function() {
            settings.currentApiPresetIndex = parseInt($(this).val());
            saveSettings();
            renderApiPresetsUI();
        });

        $('#cw_btn_add_preset').on('click', function() {
            const name = prompt("请输入新预设的名称:");
            if (name) {
                settings.apiPresets.push({ name: name, url: "", key: "", model: "" });
                settings.currentApiPresetIndex = settings.apiPresets.length - 1;
                saveSettings();
                renderApiPresetsUI();
            }
        });

        $('#cw_btn_del_preset').on('click', function() {
            if (settings.apiPresets.length <= 1) return alert("至少保留一个预设！");
            if (confirm("确定要删除当前预设吗？")) {
                settings.apiPresets.splice(settings.currentApiPresetIndex, 1);
                settings.currentApiPresetIndex = 0;
                saveSettings();
                renderApiPresetsUI();
            }
        });

        $('#cw_btn_rename_preset').on('click', function() {
            const preset = settings.apiPresets[settings.currentApiPresetIndex];
            const name = prompt("请输入新名称:", preset.name);
            if (name) {
                preset.name = name;
                saveSettings();
                renderApiPresetsUI();
            }
        });

        $('#cw_custom_api_url, #cw_custom_api_key, #cw_custom_api_model').on('input', function() {
            const preset = settings.apiPresets[settings.currentApiPresetIndex];
            preset.url = $('#cw_custom_api_url').val();
            preset.key = $('#cw_custom_api_key').val();
            preset.model = $('#cw_custom_api_model').val();
            saveSettings();
        });

        let currentEditingTarget = null;
        let isEditingExtraInfo = false;
        let editingCharName = null;

        $('.cw_btn_expand_text').on('click', function() {
            isEditingExtraInfo = false;
            currentEditingTarget = $(this).data('target');
            $('#cw_text_modal_title').text(currentEditingTarget === 'cw_modal_prompt' ? '编辑 Prompt' : '编辑 语录库');
            $('#cw_text_modal_area').val($('#' + currentEditingTarget).val());
            $('#cw_text_modal_overlay').fadeIn(200);
        });

        $('#cw_char_items_container').on('click', '.cw-btn-extra-info', function() {
            isEditingExtraInfo = true;
            editingCharName = $(this).closest('.cw-char-item').data('name');
            const conf = settings.charConfigs[editingCharName] || {};
            $('#cw_text_modal_title').text(`编辑设定/世界书 [${editingCharName}]`);
            $('#cw_text_modal_area').val(conf.extraInfo || '');
            $('#cw_text_modal_overlay').fadeIn(200);
        });

        $('#cw_btn_save_text_modal').on('click', function() {
            const val = $('#cw_text_modal_area').val();
            if (isEditingExtraInfo) {
                if (settings.charConfigs[editingCharName]) {
                    settings.charConfigs[editingCharName].extraInfo = val;
                    saveSettings();
                    showToast(`已保存 [${editingCharName}] 的附加设定`);
                }
            } else {
                $('#' + currentEditingTarget).val(val).trigger('input');
            }
            $('#cw_text_modal_overlay').fadeOut(200);
        });
        $('#cw_btn_close_text_modal').on('click', () => $('#cw_text_modal_overlay').fadeOut(200));

        let currentTagEditingName = null;
        let currentTagEditingInput = null;
        
        function renderTagsInPicker(currentTags) {
            const listContainer = $('#cw_tag_picker_list');
            listContainer.empty();
            const allTags = [...DEFAULT_TAGS, ...(settings.customTags || [])];
            
            allTags.forEach(tag => {
                const isActive = currentTags.includes(tag) ? 'active' : '';
                const isChecked = currentTags.includes(tag) ? 'checked' : '';
                const isCustom = !DEFAULT_TAGS.includes(tag);
                
                listContainer.append(`
                    <label class="cw-tag-checkbox-label ${isActive}">
                        <input type="checkbox" value="${tag}" ${isChecked}> ${tag}
                        ${isCustom ? `<span class="cw-tag-delete" data-tag="${tag}">✕</span>` : ''}
                    </label>
                `);
            });
        }

        $('#cw_char_items_container').on('click', '.cw-tag-input', function() {
            currentTagEditingInput = $(this);
            currentTagEditingName = $(this).closest('.cw-char-item').data('name');
            const currentTags = ($(this).val() || '').split(/[,，、\s]+/).filter(t=>t);
            renderTagsInPicker(currentTags);
            $('#cw_new_tag_input').val('');
            $('#cw_tag_picker_overlay').fadeIn(150);
        });

        $(document).on('change', '.cw-tag-checkbox-label input', function() {
            if ($(this).is(':checked')) $(this).parent().addClass('active');
            else $(this).parent().removeClass('active');
        });

        $('#cw_btn_add_custom_tag').on('click', function() {
            const newTag = $('#cw_new_tag_input').val().trim();
            if (!newTag) return;
            const allTags = [...DEFAULT_TAGS, ...(settings.customTags || [])];
            if (allTags.includes(newTag)) return alert('标签已存在！');
            
            settings.customTags.push(newTag);
            saveSettings();
            
            let currentTags = [];
            $('.cw-tag-checkbox-label input:checked').each(function() { currentTags.push($(this).val()); });
            currentTags.push(newTag);
            
            renderTagsInPicker(currentTags);
            $('#cw_new_tag_input').val('');
        });

        $(document).on('click', '.cw-tag-delete', function(e) {
            e.preventDefault(); e.stopPropagation();
            const delTag = $(this).data('tag');
            if(confirm(`确定删除自定义标签 [${delTag}] 吗？`)) {
                settings.customTags = settings.customTags.filter(t => t !== delTag);
                saveSettings();
                let currentTags = [];
                $('.cw-tag-checkbox-label input:checked').each(function() { 
                    if($(this).val() !== delTag) currentTags.push($(this).val()); 
                });
                renderTagsInPicker(currentTags);
            }
        });

        $('#cw_btn_save_tags').on('click', function() {
            let selected = [];
            $('.cw-tag-checkbox-label input:checked').each(function() { selected.push($(this).val()); });
            const finalStr = selected.join(',');
            currentTagEditingInput.val(finalStr);
            settings.charConfigs[currentTagEditingName].tag = finalStr;
            saveSettings();
            $('#cw_tag_picker_overlay').fadeOut(150);
        });
        $('#cw_btn_close_tags').on('click', () => $('#cw_tag_picker_overlay').fadeOut(150));

        function addCharToWakeup(name) {
            let existing = Object.entries(settings.chatStates).find(([id, state]) => state && state.charName === name);
            if (existing) {
                existing[1].userLastInteract = Date.now();
                existing[1].triggerLastInteract = Date.now();
            } else {
                const manualChatId = 'manual_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
                settings.chatStates[manualChatId] = {
                    userLastInteract: Date.now(), triggerLastInteract: Date.now(), charName: name
                };
            }
            if (!settings.charConfigs[name]) {
                settings.charConfigs[name] = { d: 2, h: 0, m: 0, s: 0, tag: '', blacklisted: true, extraInfo: '' };
            }
        }

        $('#cw_btn_add_char').on('click', function() {
            const activeNames = getActiveCharConfigs().map(c => c[0]);
            const availableChars = Object.values(characters).filter(c => c && c.name && !activeNames.includes(c.name));
            const listContainer = $('#cw_add_char_list');
            listContainer.empty();
            
            if (availableChars.length === 0) {
                listContainer.append('<div style="padding:10px; text-align:center; color:var(--cw-sub);">没有可添加的新角色</div>');
            } else {
                availableChars.forEach(c => {
                    listContainer.append(`
                        <label class="cw-add-char-item" data-name="${c.name}" style="padding:8px; border-bottom:1px solid var(--cw-border); cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <input type="checkbox" class="cw-import-chk" value="${c.name}" style="cursor:pointer; width:16px; height:16px;">
                                <span>${c.name}</span>
                            </div>
                        </label>
                    `);
                });
            }
            $('#cw_char_picker_overlay').fadeIn(150);
        });

        // ⚠️ 一键全选/反选 (导入列表)
        $(document).on('click', '#cw_btn_import_select_all', function() {
            const boxes = $('.cw-import-chk:visible');
            if (boxes.length === 0) return;
            const allChecked = boxes.length === boxes.filter(':checked').length;
            boxes.prop('checked', !allChecked);
        });

        $(document).on('click', '#cw_btn_import_selected', function() {
            let added = 0;
            $('.cw-import-chk:checked').each(function() {
                addCharToWakeup($(this).val());
                added++;
            });
            if(added > 0) {
                saveSettings();
                $('#cw_char_picker_overlay').fadeOut(150);
                showToast(`成功批量导入了 ${added} 个角色！`);
                openEmotionPanel();
            } else {
                alert('请先勾选需要导入的角色');
            }
        });

        $('#cw_add_char_search').on('input', function() {
            const keyword = $(this).val().toLowerCase();
            $('.cw-add-char-item').each(function() {
                const name = $(this).data('name').toLowerCase();
                $(this).toggle(name.includes(keyword));
            });
        });
        $('#cw_btn_close_add_char').on('click', () => $('#cw_char_picker_overlay').fadeOut(150));

        $('#cw_btn_remove_char').on('click', function() {
            const activeNames = getActiveCharConfigs().map(c => c[0]);
            const listContainer = $('#cw_remove_char_list');
            listContainer.empty();
            
            if (activeNames.length === 0) {
                listContainer.append('<div style="padding:10px; text-align:center; color:var(--cw-sub);">没有可删除的角色</div>');
            } else {
                activeNames.forEach(name => {
                    listContainer.append(`
                        <label class="cw-add-char-item" data-name="${name}" style="padding:8px; border-bottom:1px solid var(--cw-border); cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
                            <div style="display:flex; align-items:center; gap:8px;">
                                <input type="checkbox" class="cw-delete-chk" value="${name}" style="cursor:pointer; width:16px; height:16px;">
                                <span>${name}</span>
                            </div>
                        </label>
                    `);
                });
            }
            $('#cw_remove_char_picker_overlay').fadeIn(150);
        });

        // ⚠️ 一键全选/反选 (删除列表)
        $(document).on('click', '#cw_btn_delete_select_all', function() {
            const boxes = $('.cw-delete-chk:visible');
            if (boxes.length === 0) return;
            const allChecked = boxes.length === boxes.filter(':checked').length;
            boxes.prop('checked', !allChecked);
        });

        $(document).on('click', '#cw_btn_delete_selected', function() {
            let removed = 0;
            $('.cw-delete-chk:checked').each(function() {
                const name = $(this).val();
                delete settings.charConfigs[name];
                for (const [chatId, state] of Object.entries(settings.chatStates)) {
                    if (state && state.charName === name) delete settings.chatStates[chatId];
                }
                removed++;
            });
            if(removed > 0) {
                saveSettings();
                $('#cw_remove_char_picker_overlay').fadeOut(150);
                showToast(`成功删除了 ${removed} 个角色的配置！`);
                openEmotionPanel(); 
            } else {
                alert('请先勾选需要删除的角色');
            }
        });

        $('#cw_btn_close_remove_char').on('click', () => $('#cw_remove_char_picker_overlay').fadeOut(150));

        $('#cw_advanced_settings').on('click', () => { $('#cw_view_main').hide(); $('#cw_view_advanced').fadeIn(200); });
        $('#cw_btn_back_main').on('click', () => { $('#cw_view_advanced').hide(); $('#cw_view_main').fadeIn(200); });

        $('#cw_btn_test_api').on('click', async function() {
            if (!confirm("测试连接将调用 API 进行一次简短对话。\n(将消耗少量 Token) 是否继续？")) return;
            const btn = $(this);
            btn.prop('disabled', true).text('测试中...');
            try {
                const sysMsg = "You are a testing bot.";
                const userMsg = "Respond with exactly one word: OK";
                const res = await fetchCustomAPI(sysMsg, userMsg);
                alert("连接成功！API返回: " + res);
            } catch (e) {
                alert("连接失败: " + e.message);
            }
            btn.prop('disabled', false).text('测试 (消耗Token)');
        });

        $('#cw_custom_api_model').on('click', function() {
            if (cachedModels.length > 0) {
                const list = $('#cw_model_picker_list');
                list.empty();
                cachedModels.forEach(m => {
                    list.append(`<button class="cw-tool-btn cw-model-item" data-id="${m.id}" style="text-align:left; padding:8px;">${m.id}</button>`);
                });
                $('#cw_model_picker_overlay').fadeIn(150);
            } else {
                alert("模型列表为空，请先点击右侧的【拉取】按钮获取！");
            }
        });

        $('#cw_btn_fetch_models').on('click', async function() {
            if (!confirm("拉取模型列表将请求您的 API 提供商。\n(可能消耗请求次数) 是否继续？")) return;
            const btn = $(this);
            btn.prop('disabled', true).text('拉取中...');
            try {
                const preset = getCurrentPreset();
                const url = getSafeBaseUrl(preset.url) + '/models';
                const response = await fetch(url, { headers: { "Authorization": `Bearer ${preset.key}` } });
                if (!response.ok) throw new Error(response.status);
                const data = await response.json();
                
                if (data && data.data) {
                    cachedModels = data.data; 
                    const list = $('#cw_model_picker_list');
                    list.empty();
                    cachedModels.forEach(m => {
                        list.append(`<button class="cw-tool-btn cw-model-item" data-id="${m.id}" style="text-align:left; padding:8px;">${m.id}</button>`);
                    });
                    $('#cw_model_picker_overlay').fadeIn(150);
                } else {
                    throw new Error("格式不兼容");
                }
            } catch (e) {
                alert("拉取模型失败 (错误: " + e.message + ")。");
            }
            btn.prop('disabled', false).text('拉取 (消耗请求)');
        });

        $(document).on('click', '.cw-model-item', function() {
            const modelId = $(this).data('id');
            $('#cw_custom_api_model').val(modelId).trigger('input');
            $('#cw_model_picker_overlay').fadeOut(150);
        });

        $('#cw_btn_close_models').on('click', () => $('#cw_model_picker_overlay').fadeOut(150));

        $('#cw_btn_reset_prompt').on('click', function() {
            if(confirm("确定要重置 Prompt 和固定语录为默认值吗？")) {
                $('#cw_modal_prompt').val(sysPromptDefault);
                $('#cw_modal_quotes').val(defaultQuotes);
                settings.sysPrompt = sysPromptDefault;
                settings.staticQuotes = defaultQuotes;
                saveSettings();
            }
        });

        $('#cw_modal_mode').on('change', function() { settings.mode = $(this).val(); saveSettings(); });
        $('#cw_modal_quotes').on('input', function() { settings.staticQuotes = $(this).val(); saveSettings(); });
        $('#cw_modal_prompt').on('input', function() { settings.sysPrompt = $(this).val(); saveSettings(); });

        $('#cw_char_list_toggle').on('click', function() {
            $(this).toggleClass('open');
            $('#cw_char_list_content').slideToggle(200);
        });

        $('#cw_char_search').on('input', function() {
            const keyword = $(this).val().toLowerCase();
            $('.cw-char-item').each(function() {
                const name = $(this).data('name').toLowerCase();
                $(this).toggle(name.includes(keyword));
            });
        });

        $('#cw_btn_block_all').on('click', function() {
            $('.cw-char-item:visible').each(function() {
                const name = $(this).data('name');
                if (settings.charConfigs[name]) {
                    settings.charConfigs[name].blacklisted = true;
                    $(this).find('.cw-btn-toggle').addClass('blacklisted').text('屏蔽');
                }
            });
            saveSettings();
            showToast('已将当前显示的角色全部设为【屏蔽】');
        });

        $('#cw_btn_unblock_all').on('click', function() {
            $('.cw-char-item:visible').each(function() {
                const name = $(this).data('name');
                if (settings.charConfigs[name]) {
                    settings.charConfigs[name].blacklisted = false;
                    $(this).find('.cw-btn-toggle').removeClass('blacklisted').text('正常');
                }
            });
            saveSettings();
            showToast('已将当前显示的角色全部设为【正常】');
        });

        $('#cw_btn_auto_tag').on('click', async function() {
            const btn = $(this);
            if (btn.prop('disabled')) return;
            const visibleItems = $('.cw-char-item:visible');
            if (visibleItems.length === 0) return;

            if (!confirm(`将调用 API 自动为当前显示的 ${visibleItems.length} 个角色匹配标签。\n(需调用模型分析，将消耗 Token) 是否继续？`)) return;

            btn.prop('disabled', true).text(`分析中(0/${visibleItems.length})...`);
            let count = 0, failCount = 0;

            for (let i = 0; i < visibleItems.length; i++) {
                const row = $(visibleItems[i]);
                const name = row.data('name');
                try {
                    const tag = await analyzeCharacterTag(name);
                    settings.charConfigs[name].tag = tag;
                    row.find('.cw-tag-input').val(tag);
                } catch (e) {
                    failCount++;
                }
                count++;
                btn.text(`分析中(${count}/${visibleItems.length})...`);
            }
            
            saveSettings();
            if (failCount > 0) alert(`分析完成，但有 ${failCount} 个角色分配失败。`);
            else btn.text('全部分析完成！');
            setTimeout(() => btn.prop('disabled', false).text('智能分配标签 (消耗Token)'), 2000);
        });

        $('#cw_btn_auto_time').on('click', async function() {
            const btn = $(this);
            if (btn.prop('disabled')) return;
            const visibleItems = $('.cw-char-item:visible');
            if (visibleItems.length === 0) return;

            if (!confirm(`将调用 API 自动推断当前显示的 ${visibleItems.length} 个角色的忍耐极限。\n(需调用模型分析，将消耗 Token) 是否继续？`)) return;

            btn.prop('disabled', true).text(`推断中(0/${visibleItems.length})...`);
            let count = 0, failCount = 0;

            for (let i = 0; i < visibleItems.length; i++) {
                const row = $(visibleItems[i]);
                const name = row.data('name');
                
                const timeObj = await analyzeCharacterTime(name);
                if (timeObj.isFallback) failCount++;

                settings.charConfigs[name].d = timeObj.d;
                settings.charConfigs[name].h = timeObj.h;
                settings.charConfigs[name].m = timeObj.m;
                settings.charConfigs[name].s = timeObj.s;
                
                row.find('.cw-d').val(timeObj.d);
                row.find('.cw-h').val(timeObj.h);
                row.find('.cw-m').val(timeObj.m);
                row.find('.cw-s').val(timeObj.s);

                count++;
                btn.text(`推断中(${count}/${visibleItems.length})...`);
            }
            
            saveSettings();
            if (failCount > 0) alert(`分析完成，但有 ${failCount} 个角色解析失败（已重置为兜底的2天）。`);
            else btn.text('全部推断完成！');
            setTimeout(() => btn.prop('disabled', false).text('智能分配时间 (消耗Token)'), 2000);
        });

        $('#cw_char_items_container').on('change', '.cw-time-input', function() {
            const $row = $(this).closest('.cw-char-item');
            const name = $row.data('name');
            
            let d = parseInt($row.find('.cw-d').val());
            let h = parseInt($row.find('.cw-h').val());
            let m = parseInt($row.find('.cw-m').val());
            let s = parseInt($row.find('.cw-s').val());

            if (isNaN(d) || d < 0) d = 0;
            if (isNaN(h) || h < 0) h = 0; if (h > 23) h = 23;
            if (isNaN(m) || m < 0) m = 0; if (m > 59) m = 59;
            if (isNaN(s) || s < 0) s = 0; if (s > 59) s = 59;

            $row.find('.cw-d').val(d);
            $row.find('.cw-h').val(h);
            $row.find('.cw-m').val(m);
            $row.find('.cw-s').val(s);

            settings.charConfigs[name].d = d;
            settings.charConfigs[name].h = h;
            settings.charConfigs[name].m = m;
            settings.charConfigs[name].s = s;
            
            saveSettings();
        });

        $('#cw_char_items_container').on('click', '.cw-btn-toggle', function() {
            const $row = $(this).closest('.cw-char-item');
            const name = $row.data('name');
            settings.charConfigs[name].blacklisted = !settings.charConfigs[name].blacklisted;
            saveSettings();
            $(this).toggleClass('blacklisted', settings.charConfigs[name].blacklisted)
                   .text(settings.charConfigs[name].blacklisted ? '屏蔽' : '正常');
        });

        $('#cw_close_modal, #cw_emotion_modal_wrapper').on('click', function(e) {
            if (e.target === this) $('#cw_emotion_modal_wrapper').fadeOut(300);
        });
    }

    renderApiPresetsUI();
    $('#cw_modal_mode').val(settings.mode);
    $('#cw_modal_quotes').val(settings.staticQuotes);
    $('#cw_modal_prompt').val(settings.sysPrompt);

    const charList = getActiveCharConfigs();
    
    let charHtml = charList.map(([name, conf]) => `
        <div class="cw-char-item" data-name="${name}">
            <div class="cw-char-name" title="${name}">${name}</div>
            <input type="text" class="cw-tag-input" readonly placeholder="点击选标签" value="${conf.tag || ''}" title="点击多选标签">
            <button class="cw-btn-extra-info" title="编辑专属设定/世界书">📖设定</button>
            <div class="cw-char-settings">
                <input class="cw-time-input cw-d" type="number" min="0" value="${conf.d}">日
                <input class="cw-time-input cw-h" type="number" min="0" max="23" value="${conf.h}">时
                <input class="cw-time-input cw-m" type="number" min="0" max="59" value="${conf.m}">分
                <input class="cw-time-input cw-s" type="number" min="0" max="59" value="${conf.s}">秒
                <button class="cw-btn-toggle ${conf.blacklisted ? 'blacklisted' : ''}">${conf.blacklisted ? '屏蔽' : '正常'}</button>
            </div>
        </div>
    `).join('');

    if (charHtml.length === 0) {
        charHtml = `<div style="text-align:center; padding: 20px; color: var(--cw-sub);">暂无已激活角色的记录。<br>请先打开某个角色的聊天界面或点击导入。</div>`;
    }
    $('#cw_char_items_container').html(charHtml);

    applyTheme(settings.theme === 'dark');
    $('#cw_emotion_modal_wrapper').fadeIn(200);
}

function bindConfigPanel() {
    $('#cw_chk_enable').prop('checked', settings.enabled).on('change', function() {
        settings.enabled = this.checked; saveSettings(); createFloatButton();
    });
    $('#cw_chk_float').prop('checked', settings.floatingUI).on('change', function() {
        settings.floatingUI = this.checked; saveSettings(); createFloatButton();
    });
    $('#cw_btn_open_panel').on('click', openEmotionPanel);
    
    $('#cw_btn_reset_float').on('click', function() {
        settings.floatPos = null;
        saveSettings();
        createFloatButton(); // 百分比重构后，这里会自动回到安全区！
        showToast("悬浮球位置已重置至右下角！");
    });
}

jQuery(async () => {
    try {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `/${extensionFolderPath}/style.css`;
        document.head.appendChild(link);

        const html = await $.get(`${extensionFolderPath}/index.html`);
        $('#extensions_settings').append(html);

        if (settings.sysPrompt) {
            settings.sysPrompt = settings.sysPrompt.replace(/\{+(char|user|time|description|personality|scenario|mes_example|chat_history|extra_info)\}+/g, '{{$1}}');
        }
        if (settings.staticQuotes) {
            settings.staticQuotes = settings.staticQuotes.replace(/\{+(char|user|time)\}+/g, '{{$1}}');
        }

        bindConfigPanel();
        createFloatButton();

        if (window.eventSource) {
            window.eventSource.on('message_sent', updateInteraction);
            window.eventSource.on('message_swiped', updateInteraction);
            window.eventSource.on('chat_changed', updateInteraction);
            window.eventSource.on('message_received', updateInteraction);
            window.eventSource.on('message_edited', updateInteraction);
            window.eventSource.on('generation_ended', updateInteraction);
        }

        startPolling();
    } catch (error) {
        console.error("[只给思念让路] 初始化失败:", error);
    }
});

export { extension_settings };