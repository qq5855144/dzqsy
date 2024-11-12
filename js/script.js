let searchEngine = 'bing';
let deleteMode = false;
let showShortcutNames = localStorage.getItem('showShortcutNames') !== 'false'; 
const storedBackground = localStorage.getItem('userBackground');
const backgroundContainer = document.getElementById('background-container');
const mask = document.getElementById('mask');

if (storedBackground) {
    backgroundContainer.style.backgroundImage = `url('${storedBackground}')`;
}

window.onload = function() {
    const defaultBackground = 'img/icon1.png';
    if (!storedBackground) {
        backgroundContainer.style.backgroundImage = `url('${defaultBackground}')`;
        localStorage.setItem('userBackground', defaultBackground);
    } else {
        backgroundContainer.style.backgroundImage = `url('${storedBackground}')`;
    }

    loadShortcuts();
    updateTextColorBasedOnBackground();
    const savedBlur = localStorage.getItem('backgroundBlur');
    const savedMask = localStorage.getItem('backgroundMask'); 
    if (savedBlur) {
        document.getElementById('blur-range').value = savedBlur;
        backgroundContainer.style.filter = `blur(${savedBlur}px)`;
    }
    if (savedMask) {
        document.getElementById('mask-range').value = savedMask;
        mask.style.backgroundColor = `rgba(0, 0, 0, ${savedMask / 100})`; 
    }
    const shortcutItems = document.querySelectorAll('.grid-item span');
    shortcutItems.forEach(item => {
        item.style.display = showShortcutNames ? 'block' : 'none'; 
    });
};
class SearchHint {
    constructor() {
        this.searchInput = document.getElementById('search-input');
        this.suggestionsBox = document.getElementById('suggestions-box');
        this.init();
    }
    init() {
        this.watchInput();
        this.searchInput.onblur = () => {
            setTimeout(() => {
                this.suggestionsBox.style.display = 'none';
            }, 200);
        };
    }
    watchInput() {
        this.searchInput.onkeyup = () => {
            if (this.searchInput.value.length === 0) {
                this.clearSuggestions();
                return;
            }
            this.fetchSuggestions();
        };
        this.searchInput.onfocus = () => {
            if (this.searchInput.value.length > 0) {
                this.suggestionsBox.style.display = 'block';
            }
        };
    }
    fetchSuggestions() {
        const script = document.createElement('script');
        script.src = `https://www.baidu.com/su?wd=${encodeURIComponent(this.searchInput.value)}&cb=showSuggestions`;
        document.body.appendChild(script);
        document.body.removeChild(script);
    }
    clearSuggestions() {
        this.suggestionsBox.innerHTML = '';
        this.suggestionsBox.style.display = 'none';
    }
    showMsg(msg) {
        let str = msg.s.map(suggestion => 
            `<div class="suggestion-item" onclick="selectSuggestion('${suggestion}')">${suggestion}</div>`
        ).join('');
        this.suggestionsBox.innerHTML = str;
        this.suggestionsBox.style.display = str ? 'block' : 'none';
    }
}

function showSuggestions(msg) {
    new SearchHint().showMsg(msg);
}

function selectSuggestion(suggestion) {
    document.getElementById('search-input').value = suggestion;
    document.getElementById('suggestions-box').style.display = 'none';
    performSearch();
}

function setSearchEngine(engine, button) {
    searchEngine = engine;
    document.querySelectorAll('.engine-button').forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    performSearch();
}

function performSearch() {
    const query = document.getElementById('search-input').value;
    if (!query) return;
    const urlPattern = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i;
    if (urlPattern.test(query)) {
        window.open(query.startsWith('http') ? query : 'http://' + query, '_self');
        return;
    }
    const searchUrls = {
        bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
        baidu: `https://www.baidu.com/s?wd=${encodeURIComponent(query)}`,
        google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
        yandex: `https://www.yandex.com/search/touch/?text=${encodeURIComponent(query)}`,
        bita: `https://metaso.cn/?q=${encodeURIComponent(query)}`,
        imageSearch: `https://vt.quark.cn/blm/search-pic-list-203/index?type=pic&source=sc&scname=life_show_general_image&hid=3a4f9367b6e04330a921841a61079a36&uid=2ac24681ee9b49d7a5beaaf6cd653c32|||1730046378&uc_param_str=dnntnwvepffrgibijbprsvdsdicheiniut&from=&databucket=new2&fromdetail=3#/` + encodeURIComponent(query),
        apkpure: `https://apkpure.com/search?q=${encodeURIComponent(query)}`
    };
    window.open(searchUrls[searchEngine], '_self');
}

function clearSearchInput() {
    document.getElementById('search-input').value = '';
    document.getElementById('suggestions-box').style.display = 'none';
}

function loadShortcuts() {
    const shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
    const shortcutContainer = document.getElementById('shortcut-container');
    shortcutContainer.innerHTML = '';
    if (shortcuts.length === 0) {
        const defaultShortcuts = [
            { title: '个人主页', url: 'https://link3.cc/cbkey', image: 'img/zy.png' },
            { title: '哔哩哔哩', url: 'https://m.bilibili.com/', image: 'img/bilibili.png' },
            { title: 'Github', url: 'https://github.com/', image: 'img/github.png' },
            { title: '油猴', url: 'https://greasyfork.org/zh-CN', image: 'img/you.png' },
            { title: '脚本合集', url: 'https://gitlink.org.cn/damengzhu/XBrowser-User-Scripts/tree/master/X浏览器脚本整理.md', image: 'img/js.png' }
        ];
        localStorage.setItem('shortcuts', JSON.stringify(defaultShortcuts));
        defaultShortcuts.forEach(shortcut => createShortcutElement(shortcut));
    } else {
        shortcuts.forEach(createShortcutElement);
    }
}

function createShortcutElement({ title, url, image }) {
    const shortcutContainer = document.getElementById('shortcut-container');
    const newItem = document.createElement('div');
    newItem.className = 'grid-item';
    newItem.onclick = () => {
        if (!deleteMode) {
            window.open(url, '_self');
        }
    };
    newItem.innerHTML = `
        <img src="${image}" alt="${title}">
        <span style="display: ${showShortcutNames ? 'block' : 'none'};">${title}</span>
        <div class="delete-icon" onclick="removeShortcut(event)" style="display: ${deleteMode ? 'flex' : 'none'};">&times;</div>
    `;
    shortcutContainer.appendChild(newItem);
}

function openAddDialog() {
    document.getElementById('add-dialog').style.display = 'block';
}

function closeAddDialog() {
    document.getElementById('add-dialog').style.display = 'none';
}

function addShortcut() {
    const title = document.getElementById('icon-title').value;
    const url = document.getElementById('icon-url').value;
    const image = document.getElementById('icon-image').value;

    if (!title || !url || !image) {
        alert('请填写所有字段！');
        return;
    }

    if (image.startsWith('data:image/')) {
        saveShortcut(title, url, image);
    } else {
        fetch(image)
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => saveShortcut(title, url, reader.result);
                reader.readAsDataURL(blob);
            })
            .catch(() => alert('图标链接无效，请确保链接正确！'));
    }
}

function saveShortcut(title, url, image) {
    const shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
    shortcuts.push({ title, url, image });
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
    createShortcutElement({ title, url, image });
    closeAddDialog();
    clearInputFields();
    updateTextColorBasedOnBackground(); 
}

function clearInputFields() {
    document.getElementById('icon-title').value = '';
    document.getElementById('icon-url').value = '';
    document.getElementById('icon-image').value = '';
}

function chooseImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = event => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('icon-image').value = e.target.result;
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

function openBackgroundDialog() {
    document.getElementById('background-dialog').style.display = 'block';
}

function closeBackgroundDialog() {
    document.getElementById('background-dialog').style.display = 'none';
}

function setBackground() {
    const url = document.getElementById('background-url').value;
    if (url) {
        backgroundContainer.style.backgroundImage = `url('${url}')`;
        localStorage.setItem('userBackground', url);
        closeBackgroundDialog();
        updateTextColorBasedOnBackground(); 
    } else {
        alert('请填写背景图片链接！');
    }
}

function chooseBackgroundImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = event => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = e => {
            document.getElementById('background-url').value = e.target.result;
            setBackground(); 
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

function openExportImportDialog() {
    document.getElementById('export-import-dialog').style.display = 'block';
}

function exportData() {
    const shortcuts = localStorage.getItem('shortcuts');
    const userBackground = localStorage.getItem('userBackground');
    const dataToExport = {
        shortcuts: shortcuts ? JSON.parse(shortcuts) : [],
        userBackground: userBackground || ''
    };
    const blob = new Blob([JSON.stringify(dataToExport)], { type: 'application/json' });
    saveAs(blob, 'data.json');
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = event => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            if (data.shortcuts) {
                localStorage.setItem('shortcuts', JSON.stringify(data.shortcuts));
                loadShortcuts();
            }
            if (data.userBackground) {
                localStorage.setItem('userBackground', data.userBackground);
                backgroundContainer.style.backgroundImage = `url('${data.userBackground}')`;
                updateTextColorBasedOnBackground(); 
            }
            closeExportImportDialog();
        };
        reader.readAsText(file);
    };
    input.click();
}

function closeExportImportDialog() {
    document.getElementById('export-import-dialog').style.display = 'none';
}

function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
}

function toggleDeleteMode() {
    deleteMode = !deleteMode;
    loadShortcuts(); 
}

function removeShortcut(event) {
    event.stopPropagation();
    const title = event.target.parentElement.querySelector('span').innerText;
    let shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || [];
    shortcuts = shortcuts.filter(item => item.title !== title); 
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
    loadShortcuts();
    updateTextColorBasedOnBackground(); 
}

function toggleShortcutNames() {
    showShortcutNames = !showShortcutNames; 
    localStorage.setItem('showShortcutNames', showShortcutNames);
    const shortcutItems = document.querySelectorAll('.grid-item span');
    shortcutItems.forEach(item => {
        item.style.display = showShortcutNames ? 'block' : 'none'; 
    });
}

function updateTextColorBasedOnBackground() {
    const backgroundImageUrl = localStorage.getItem('userBackground');
    if (backgroundImageUrl) {
        const img = new Image();
        img.src = backgroundImageUrl;
        img.crossOrigin = 'Anonymous'; 
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            let r = 0, g = 0, b = 0;
            const pixelCount = data.length / 4;

            for (let i = 0; i < pixelCount; i++) {
                r += data[i * 4];
                g += data[i * 4 + 1];
                b += data[i * 4 + 2];
            }

            r = Math.floor(r / pixelCount);
            g = Math.floor(g / pixelCount);
            b = Math.floor(b / pixelCount);                    
            const brightness = (r * 299 + g * 587 + b * 114) / 1000;
            const textColor = brightness > 125 ? '#000' : '#FFF'; 
            document.querySelectorAll('.grid-item span').forEach(item => {
                item.style.color = textColor;
            });
            const sidebarButtons = document.querySelectorAll('#sidebar img, .toggle-button');
            sidebarButtons.forEach(button => {
                button.style.filter = brightness > 125 ? 'invert(1)' : 'invert(0)';
            });
        };
    }
}

function openBlurDialog() {
    document.getElementById('blur-dialog').style.display = 'block';
}

function closeBlurDialog() {
    document.getElementById('blur-dialog').style.display = 'none';
}

function updateBlurValue(value) {
    backgroundContainer.style.filter = `blur(${value}px)`; 
}

function updateMaskValue(value) {
    const mask = document.getElementById('mask');
    mask.style.backgroundColor = `rgba(0, 0, 0, ${value / 100})`; 
}

function setBlur() {
    const blurValue = document.getElementById('blur-range').value;
    const maskValue = document.getElementById('mask-range').value;            
    backgroundContainer.style.filter = `blur(${blurValue}px)`; 
    updateMaskValue(maskValue); 
    localStorage.setItem('backgroundBlur', blurValue);
    localStorage.setItem('backgroundMask', maskValue);
    closeBlurDialog();
}

window.onclick = function(event) {
    const sidebar = document.getElementById('sidebar');
    const toggleButton = document.querySelector('.toggle-button');
    if (!sidebar.contains(event.target) && !toggleButton.contains(event.target)) {
        sidebar.classList.remove('open');
        if (deleteMode) {
            toggleDeleteMode();
        }
    }
}
