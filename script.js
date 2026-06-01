// DOM Cache Elements
const clockTime = document.getElementById('clockTime');
const clockFullDate = document.getElementById('clockFullDate');
const dateDayName = document.getElementById('dateDayName');
const dateDayNumber = document.getElementById('dateDayNumber');
const dateMonthName = document.getElementById('dateMonthName');

const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const settingsPanel = document.getElementById('settingsPanel');

const scaleSlider = document.getElementById('scaleSlider');
const scaleValue = document.getElementById('scaleValue');
const appScaleWrapper = document.getElementById('appScaleWrapper');

const displayNickname = document.getElementById('displayNickname');
const inputNickname = document.getElementById('inputNickname');

const wallpaperTemplateGrid = document.getElementById('wallpaperTemplateGrid');
const wallpaperUpload = document.getElementById('wallpaperUpload');
const resetWallpaperBtn = document.getElementById('resetWallpaperBtn');
const fontUpload = document.getElementById('fontUpload');
const resetFontBtn = document.getElementById('resetFontBtn');

const todoInput = document.getElementById('todoInput');
const todoAddBtn = document.getElementById('todoAddBtn');
const todoList = document.getElementById('todoList');

// UI Module Toggle Nodes
const toggles = {
  'widget-quicklinks': document.getElementById('toggleQuicklinks'),
  'widget-date': document.getElementById('toggleDate'),
  'widget-clock': document.getElementById('toggleClock'),
  'widget-todo': document.getElementById('toggleTodo'),
  'widget-weather': document.getElementById('toggleWeather')
};

// ============================================================================
// 🚨 ALERT: WALLPAPER CATALOG ARCHITECTURE SYSTEM
// DIRECTLY BELOW IS THE TEMPLATE ARRAY. TO ADD EXTRA WALLPAPERS IN THE FUTURE, 
// JUST COPY-PASTE A NEW ROW FORMATTED AS: "URL_LINK_HERE", 
// YOU CAN ADD A HUGE NUMBER OF TEMPLATES (HUNDREDS) WITH NO PERFORMANCE LOSS!
// ============================================================================
const WALLPAPER_TEMPLATES = [
  "https://i.postimg.cc/HsQZSyRL/Banner-S26M.png",
  "https://i.postimg.cc/8PhKy695/comiss-20251230075456.png",
  "https://i.postimg.cc/qM8bm3Sq/comiss-20251230090754.png",
  "https://i.postimg.cc/J4b6TkvD/comiss2-20260101101308.png",
  "https://i.postimg.cc/Yq1nXWZm/comiss2-20260102092842.png",
  "https://i.postimg.cc/DyqjCXHX/comiss2-20260102140550.png",
  "https://i.postimg.cc/Vs0HCTF2/starrysimthumbnail.png",
  "https://i.postimg.cc/YqcDf3nH/thumbnail-for-the-outbreak.png",
  "https://i.postimg.cc/dtMNmBHv/Untitled184-20251228204823.png",
  "https://i.postimg.cc/yYqpXPQ6/Untitled184-20251228205241.png",
  "https://i.postimg.cc/zXm2SjtX/Untitled185.png",
  "https://i.postimg.cc/rFSnhr3q/Untitled185-20251229215549.png"
  // 📥 **PASTE FUTURE WALLPAPER LINKS DIRECTLY RIGHT UNDER THIS LINE** 📥
  // "https://your-new-image-link-here.png",
  // "https://another-awesome-wallpaper.jpg"
];
// ============================================================================
// 🚨 END OF WALLPAPER TEMPLATE ADDITION ZONE
// ============================================================================

let todoItems = [];

// App Launch Initialization Routine
document.addEventListener('DOMContentLoaded', async () => {
  startClockEngine();
  buildWallpaperTemplatesUI();
  initDrawerEvents();
  await loadSavedConfiguration();
  initTodoEngine();
});

// Real-Time Clock & Date Module Logic
function startClockEngine() {
  const updateClock = () => {
    const now = new Date();
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    clockTime.textContent = `${hrs}:${mins}:${secs}`;
    
    const optionsFull = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    clockFullDate.textContent = now.toLocaleDateString('en-US', optionsFull);
    
    dateDayName.textContent = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    dateDayNumber.textContent = now.getDate();
    dateMonthName.textContent = now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  };
  updateClock();
  setInterval(updateClock, 1000);
}

// Generate the template select grid elements dynamically
function buildWallpaperTemplatesUI() {
  WALLPAPER_TEMPLATES.forEach((url, index) => {
    const img = document.createElement('img');
    img.src = url;
    img.className = 'template-thumb';
    img.title = `Template Background ${index + 1}`;
    img.alt = `Wallpaper background selection ${index + 1}`;
    img.addEventListener('click', () => {
      document.body.style.backgroundImage = `url('${url}')`;
      chrome.storage.local.set({ customWallpaper: url });
    });
    wallpaperTemplateGrid.appendChild(img);
  });
}

// Drawer Control Events Setup
function initDrawerEvents() {
  settingsBtn.addEventListener('click', () => settingsPanel.classList.add('open'));
  closeSettingsBtn.addEventListener('click', () => settingsPanel.classList.remove('open'));
  
  document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== settingsBtn && settingsPanel.classList.contains('open')) {
      settingsPanel.classList.remove('open');
    }
  });

  // Real-time custom nickname processing sync
  inputNickname.addEventListener('input', (e) => {
    const value = e.target.value.trim() || 'Friend';
    displayNickname.textContent = value;
    chrome.storage.local.set({ userNickname: value });
  });

  // Scale Config Sync
  scaleSlider.addEventListener('input', (e) => {
    const scale = e.target.value;
    scaleValue.textContent = Math.round(scale * 100);
    document.documentElement.style.setProperty('--ui-scale', scale);
    chrome.storage.local.set({ uiScale: scale });
  });

  // Visibility Toggles Router loop
  Object.keys(toggles).forEach(widgetId => {
    toggles[widgetId].addEventListener('change', (e) => {
      const isVisible = e.target.checked;
      document.getElementById(widgetId).style.display = isVisible ? (widgetId === 'widget-quicklinks' ? 'flex' : '') : 'none';
      chrome.storage.local.set({ [`show-${widgetId}`]: isVisible });
    });
  });

  wallpaperUpload.addEventListener('change', processWallpaperFile);
  resetWallpaperBtn.addEventListener('click', clearCustomWallpaper);
  fontUpload.addEventListener('change', processFontFile);
  resetFontBtn.addEventListener('click', clearCustomFont);
}

// Load System Configurations
async function loadSavedConfiguration() {
  const keys = ['uiScale', 'customWallpaper', 'customFont', 'todoList', 'userNickname', 'show-widget-quicklinks', 'show-widget-date', 'show-widget-clock', 'show-widget-todo', 'show-widget-weather'];
  
  chrome.storage.local.get(keys, (data) => {
    // Nickname setting fallback default rule
    if (data.userNickname) {
      displayNickname.textContent = data.userNickname;
      inputNickname.value = data.userNickname;
    }

    if (data.uiScale) {
      scaleSlider.value = data.uiScale;
      scaleValue.textContent = Math.round(data.uiScale * 100);
      document.documentElement.style.setProperty('--ui-scale', data.uiScale);
    }

    if (data.customWallpaper) {
      document.body.style.backgroundImage = `url('${data.customWallpaper}')`;
    }

    if (data.customFont) {
      applyDynamicFontAsset(data.customFont);
    }

    Object.keys(toggles).forEach(widgetId => {
      const isVisible = data[`show-${widgetId}`] !== false;
      toggles[widgetId].checked = isVisible;
      document.getElementById(widgetId).style.display = isVisible ? (widgetId === 'widget-quicklinks' ? 'flex' : '') : 'none';
    });

    if (data.todoList) {
      todoItems = data.todoList;
      renderTodoEntries();
    }
  });
}

function processWallpaperFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const base64Data = event.target.result;
    document.body.style.backgroundImage = `url('${base64Data}')`;
    chrome.storage.local.set({ customWallpaper: base64Data });
  };
  reader.readAsDataURL(file);
}

function clearCustomWallpaper() {
  document.body.style.backgroundImage = '';
  wallpaperUpload.value = '';
  chrome.storage.local.remove('customWallpaper');
}

function processFontFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    const base64Data = event.target.result;
    applyDynamicFontAsset(base64Data);
    chrome.storage.local.set({ customFont: base64Data });
  };
  reader.readAsDataURL(file);
}

function applyDynamicFontAsset(base64Uri) {
  const fontFaceElement = new FontFace('UserCustomFont', `url(${base64Uri})`);
  fontFaceElement.load().then((loadedFace) => {
    document.fonts.add(loadedFace);
    document.body.style.fontFamily = '"UserCustomFont", -apple-system, sans-serif';
  }).catch(err => console.error("Font loading fail configuration run:", err));
}

function clearCustomFont() {
  document.body.style.fontFamily = '';
  fontUpload.value = '';
  chrome.storage.local.remove('customFont');
}

// Interactive Task Logic
function initTodoEngine() {
  todoAddBtn.addEventListener('click', executeAddTaskAction);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeAddTaskAction();
    }
  });
}

function executeAddTaskAction() {
  const taskText = todoInput.value.trim();
  if (!taskText) return;
  todoItems.push({ id: Date.now().toString(), text: taskText });
  todoInput.value = '';
  syncTodoDataStorage();
  renderTodoEntries();
}

function deleteTaskEntry(id) {
  todoItems = todoItems.filter(item => item.id !== id);
  syncTodoDataStorage();
  renderTodoEntries();
}

function syncTodoDataStorage() {
  chrome.storage.local.set({ todoList: todoItems });
}

function renderTodoEntries() {
  todoList.innerHTML = '';
  todoItems.forEach(item => {
    const li = document.createElement('li');
    li.className = 'todo-item';
    const textSpan = document.createElement('span');
    textSpan.textContent = item.text;
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '&times;';
    deleteBtn.addEventListener('click', () => deleteTaskEntry(item.id));
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });
}
