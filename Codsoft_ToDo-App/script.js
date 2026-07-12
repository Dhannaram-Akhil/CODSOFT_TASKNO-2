// --- Application State Management ---
let tasks = JSON.parse(localStorage.getItem('intern_tasks')) || [];
let isEditing = false;
let searchTimeout = null;

// --- DOM Target Elements ---
const taskForm = document.getElementById('taskForm');
const taskIdInput = document.getElementById('taskId');
const taskTitleInput = document.getElementById('taskTitle');
const taskCategoryInput = document.getElementById('taskCategory');
const taskPriorityInput = document.getElementById('taskPriority');
const taskDueDateInput = document.getElementById('taskDueDate');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEditBtn');

const searchBar = document.getElementById('searchBar');
const filterStatus = document.getElementById('filterStatus');
const filterCategory = document.getElementById('filterCategory');
const taskListContainer = document.getElementById('taskList');

const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const pendingTasksEl = document.getElementById('pendingTasks');
const themeToggle = document.getElementById('themeToggle');

let progressBar = null;
let categoryStatsContainer = null;

function injectAdvancedUIElements() {
    const targetGrid = document.querySelector('.stats-grid');
    if (!targetGrid) return;
    
    if (!document.querySelector('.progress-container')) {
        const pContainer = document.createElement('div');
        pContainer.className = 'progress-container';
        pContainer.innerHTML = `<div class="progress-bar" id="taskProgressBar"></div>`;
        targetGrid.parentNode.insertBefore(pContainer, targetGrid.nextSibling);
        progressBar = document.getElementById('taskProgressBar');
    }

    if (!document.getElementById('advancedPanel')) {
        const advancedPanel = document.createElement('div');
        advancedPanel.id = 'advancedPanel';
        // Updated flex parameters to cleanly align elements left-to-right without splitting them
        advancedPanel.style.cssText = "margin-bottom: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; background: var(--bg-surface); padding: 0.75rem; border-radius: 1rem; border: 1px solid var(--border); box-shadow: var(--shadow);";
        
        advancedPanel.innerHTML = `
            <div id="categoryStats" style="font-size: 0.8rem; color: var(--text-secondary); display: flex; gap: 0.5rem; flex-wrap: wrap;"></div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; width: 100%; justify-content: flex-start; transform: scale(0.95); transform-origin: left;">
                <button class="btn theme-toggle" onclick="exportTasks()" style="padding: 0.4rem 0.6rem; font-size: 0.8rem; min-height: 36px;" type="button">📤 export JSON</button>
                <button class="btn theme-toggle" onclick="triggerImport()" style="padding: 0.4rem 0.6rem; font-size: 0.8rem; min-height: 36px;" type="button">📥 import JSON</button>
                <input type="file" id="importFile" accept=".json" style="display: none;" onchange="importTasks(event)">
            </div>
        `;
        
        const controlsRow = document.querySelector('.controls-row');
        controlsRow.parentNode.insertBefore(advancedPanel, controlsRow);
        categoryStatsContainer = document.getElementById('categoryStats');
    }
}

// --- Initialization Lifecycle ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    injectAdvancedUIElements();
    renderTasks();
    setupEventListeners();
}, { passive: true }); // Passive flag increases initial mobile render speeds

function setupEventListeners() {
    taskForm.addEventListener('submit', handleTaskSubmit);
    cancelEditBtn.addEventListener('click', resetForm);
    
    searchBar.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(renderTasks, 300); 
    });
    
    filterStatus.addEventListener('change', renderTasks);
    filterCategory.addEventListener('change', renderTasks);
    themeToggle.addEventListener('click', toggleTheme);
}

// --- Application CRUD Logic ---
function handleTaskSubmit(e) {
    e.preventDefault();
    
    const title = taskTitleInput.value.trim();
    if (!title) return;

    const taskData = {
        id: taskIdInput.value || Date.now().toString(),
        title: title,
        category: taskCategoryInput.value,
        priority: taskPriorityInput.value,
        dueDate: taskDueDateInput.value || '',
        completed: false
    };

    if (isEditing) {
        const index = tasks.findIndex(t => t.id === taskData.id);
        taskData.completed = tasks[index].completed;
        tasks[index] = taskData;
        isEditing = false;
    } else {
        tasks.push(taskData);
    }

    saveToLocalStorage();
    resetForm();
    renderTasks();
    
    // Dismiss mobile soft keyboards upon formal submittal action
    document.activeElement.blur();
}

window.toggleTaskStatus = function(id) {
    tasks = tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task);
    saveToLocalStorage();
    renderTasks();
};

window.editTask = function(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    isEditing = true;
    taskIdInput.value = task.id;
    taskTitleInput.value = task.title;
    taskCategoryInput.value = task.category;
    taskPriorityInput.value = task.priority;
    taskDueDateInput.value = task.dueDate;

    submitBtn.innerText = '💾 Update Task';
    cancelEditBtn.style.display = 'inline-flex';
    
    // Smooth scroll mobile window back to input view area
    window.scrollTo({ top: 0, behavior: 'smooth' });
    taskTitleInput.focus();
};

window.deleteTask = function(id) {
    if (confirm('Delete this task permanently?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveToLocalStorage();
        renderTasks();
        if (isEditing && taskIdInput.value === id) resetForm();
    }
};

window.clearAllTasks = function() {
    if (confirm('Delete ALL tasks?')) {
        tasks = [];
        saveToLocalStorage();
        resetForm();
        renderTasks();
    }
};

function resetForm() {
    isEditing = false;
    taskForm.reset();
    taskIdInput.value = '';
    submitBtn.innerText = '✨ Add Task';
    cancelEditBtn.style.display = 'none';
}

function saveToLocalStorage() {
    localStorage.setItem('intern_tasks', JSON.stringify(tasks));
}

window.exportTasks = function() {
    if (tasks.length === 0) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "tasks_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
};

window.triggerImport = function() {
    document.getElementById('importFile').click();
};

window.importTasks = function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsedTasks = JSON.parse(e.target.result);
            if (Array.isArray(parsedTasks)) {
                tasks = parsedTasks;
                saveToLocalStorage();
                renderTasks();
            }
        } catch (err) { alert("Import error."); }
    };
    reader.readAsText(file);
};

function isOverdue(dueDateString, isCompleted) {
    if (!dueDateString || isCompleted) return false;
    const today = new Date(); today.setHours(0,0,0,0);
    const dueDate = new Date(dueDateString); dueDate.setHours(0,0,0,0);
    return dueDate < today;
}

function updateMetrics() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalTasksEl.innerText = total;
    completedTasksEl.innerText = completed;
    pendingTasksEl.innerText = pending;

    if (progressBar) {
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        progressBar.style.width = `${percentage}%`;
    }

    if (categoryStatsContainer) {
        if (total === 0) {
            categoryStatsContainer.innerHTML = "📊 No task data.";
            return;
        }
        const counts = {};
        tasks.forEach(t => counts[t.category] = (counts[t.category] || 0) + 1);
        categoryStatsContainer.innerHTML = "📊 " + Object.entries(counts)
            .map(([cat, count]) => `${cat}: ${count}`).join(' | ');
    }
}

function renderTasks() {
    updateMetrics();
    taskListContainer.innerHTML = '';

    const searchTerm = searchBar.value.toLowerCase();
    const statusFilter = filterStatus.value;
    const categoryFilter = filterCategory.value;

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchTerm);
        const matchesStatus = statusFilter === 'all' || 
            (statusFilter === 'completed' && task.completed) || 
            (statusFilter === 'pending' && !task.completed);
        const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    if (filteredTasks.length === 0) {
        taskListContainer.innerHTML = `<div class="empty-state">No matching tasks found.</div>`;
        return;
    }

    const priorityWeight = { high: 3, medium: 2, low: 1 };
    filteredTasks.sort((a, b) => {
        const aOverdue = isOverdue(a.dueDate, a.completed);
        const bOverdue = isOverdue(b.dueDate, b.completed);
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;
        if (a.dueDate && b.dueDate && !a.completed && !b.completed) {
            return new Date(a.dueDate) - new Date(b.dueDate);
        }
        return priorityWeight[b.priority] - priorityWeight[a.priority];
    });

    filteredTasks.forEach(task => {
        const overdueCheck = isOverdue(task.dueDate, task.completed);
        const div = document.createElement('div');
        div.className = `task-item priority-${task.priority} ${task.completed ? 'completed' : ''}`;
        
        div.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskStatus('${task.id}')">
            <div class="task-content">
                <div class="task-title">${escapeHTML(task.title)}</div>
                <div class="task-meta">
                    <span class="badge">📁 ${task.category}</span>
                    <span class="badge">🔥 ${task.priority.toUpperCase()}</span>
                    <span class="badge">📅 ${task.dueDate || 'No Date'}</span>
                    ${overdueCheck ? '<span class="badge badge-overdue">⚠️ OVERDUE</span>' : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon" onclick="editTask('${task.id}')">✏️</button>
                <button class="btn-icon" style="color:var(--danger);" onclick="deleteTask('${task.id}')">🗑️</button>
            </div>
        `;
        taskListContainer.appendChild(div);
    });

    if (tasks.length > 0) {
        const footerDiv = document.createElement('div');
        footerDiv.className = 'list-footer';
        footerDiv.innerHTML = `<button class="btn btn-danger" onclick="clearAllTasks()">🧹 Clear All Tasks</button>`;
        taskListContainer.appendChild(footerDiv);
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag));
}

function initTheme() {
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.innerText = currentTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.innerText = newTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
}