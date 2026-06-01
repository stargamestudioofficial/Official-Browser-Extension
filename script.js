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

const wallpaperUpload = document.getElementById('wallpaperUpload');
const resetWallpaperBtn = document.getElementById('resetWallpaperBtn');
const fontUpload = document.getElementById('fontUpload');
const resetFontBtn = document.getElementById('resetFontBtn');

const todoInput = document.getElementById('todoInput');
const todoAddBtn = document.getElementById('todoAddBtn');
const todoList = document.getElementById('todoList');

// UI Module Toggle Nodes
const toggles = {
  'widget-date': document.getElementById('toggleDate'),
  'widget-clock': document.getElementById('toggleClock'),
  'widget-todo': document.getElementById('toggleTodo'),
  'widget-weather': document.getElementById('toggleWeather')
};

// Core Setup State
let todoItems = [];

// App Launch Initialization Routine
document.addEventListener('DOMContentLoaded', async () => {
  startClockEngine();
  initDrawerEvents();
  await loadSavedConfiguration();
  initTodoEngine();
});

// Real-Time Dynamic Clock & Date Module Logic
function startClockEngine() {
  const updateClock = () => {
    const now = new Date();
    
    // Time String Calculation
    const hrs = String(now.getHours()).padStart(2, '0');
    const mins = String(now.getMinutes()).padStart(2, '0');
    const secs = String(now.getSeconds()).padStart(2, '0');
    clockTime.textContent = `${hrs}:${mins}:${secs}`;
    
    // Exact structural date matching reference design formatting requirements
    const optionsFull = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    clockFullDate.textContent = now.toLocaleDateString('en-US', optionsFull);
    
    // Date Widget Breakdown Data sets
    dateDayName.textContent = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
    dateDayNumber.textContent = now.getDate();
    dateMonthName.textContent = now.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
  };
  
  updateClock();
  setInterval(updateClock, 1000);
}

// Customizer Drawer Control Events Setup
function initDrawerEvents() {
  settingsBtn.addEventListener('click', () => settingsPanel.classList.add('open'));
  closeSettingsBtn.addEventListener('click', () => settingsPanel.classList.remove('open'));
  
  // Outer click detection to drop panel focus out safely
  document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== settingsBtn && settingsPanel.classList.contains('open')) {
      settingsPanel.classList.remove('open');
    }
  });

  // Scale Config Sync
  scaleSlider.addEventListener('input', (e) => {
    const scale = e.target.value;
    scaleValue.textContent = Math.round(scale * 100);
    document.documentElement.style.setProperty('--ui-scale', scale);
    chrome.storage.local.set({ uiScale: scale });
  });

  // Form Element Toggle Routing Rules loop
  Object.keys(toggles).forEach(widgetId => {
    toggles[widgetId].addEventListener('change', (e) => {
      const isVisible = e.target.checked;
      document.getElementById(widgetId).style.display = isVisible ? '' : 'none';
      
      const storageKey = `show-${widgetId}`;
      chrome.storage.local.set({ [storageKey]: isVisible });
    });
  });

  // Live file processor mapping rules
  wallpaperUpload.addEventListener('change', processWallpaperFile);
  resetWallpaperBtn.addEventListener('click', clearCustomWallpaper);
  fontUpload.addEventListener('change', processFontFile);
  resetFontBtn.addEventListener('click', clearCustomFont);
}

// High Capacity System Config Loading Hook via API
async function loadSavedConfiguration() {
  const keys = ['uiScale', 'customWallpaper', 'customFont', 'todoList', 'show-widget-date', 'show-widget-clock', 'show-widget-todo', 'show-widget-weather'];
  
  chrome.storage.local.get(keys, (data) => {
    // 1. Scale Restoration Rules
    if (data.uiScale) {
      scaleSlider.value = data.uiScale;
      scaleValue.textContent = Math.round(data.uiScale * 100);
      document.documentElement.style.setProperty('--ui-scale', data.uiScale);
    }

    // 2. Wallpaper Restoration Engine
    if (data.customWallpaper) {
      document.body.style.backgroundImage = `url('${data.customWallpaper}')`;
    }

    // 3. Dynamic Font Face Injector Process
    if (data.customFont) {
      applyDynamicFontAsset(data.customFont);
    }

    // 4. Load Layout Toggles Configurations
    Object.keys(toggles).forEach(widgetId => {
      const storageKey = `show-${widgetId}`;
      const isVisible = data[storageKey] !== false; // Def to true condition
      toggles[widgetId].checked = isVisible;
      document.getElementById(widgetId).style.display = isVisible ? '' : 'none';
    });

    // 5. Restore saved Array entries to internal pointer array 
    if (data.todoList) {
      todoItems = data.todoList;
      renderTodoEntries();
    }
  });
}

// Convert asset images safely into long storage base-64 string values 
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

// Font file reader and loader
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
  }).catch(err => console.error("Font loading failure action:", err));
}

function clearCustomFont() {
  document.body.style.fontFamily = '';
  fontUpload.value = '';
  chrome.storage.local.remove('customFont');
}

// Interactive Task Management Logic Engine
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

  const newTaskItem = {
    id: Date.now().toString(),
    text: taskText
  };

  todoItems.push(newTaskItem);
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
    deleteBtn.title = 'Remove Task';
    deleteBtn.addEventListener('click', () => deleteTaskEntry(item.id));
    
    li.appendChild(textSpan);
    li.appendChild(deleteBtn);
    todoList.appendChild(li);
  });
}
