// DOM Elements
const taskInput = document.getElementById("taskInput");
const categorySelect = document.getElementById("categorySelect");
const addTaskBtn = document.getElementById("addTaskBtn");
const tasksList = document.getElementById("tasksList");
const taskCount = document.getElementById("taskCount");
const emptyState = document.getElementById("emptyState");
const filterSelect = document.getElementById("filterSelect");
const filterCategory = document.getElementById("filterCategory");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const taskTemplate = document.getElementById("taskTemplate");
const editTaskModal = document.getElementById("editTaskModal");
const editTaskInput = document.getElementById("editTaskInput");
const editCategorySelect = document.getElementById("editCategorySelect");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const closeModal = document.querySelector(".close-modal");

// Task Management
let tasks = [];
let currentEditId = null;

// Initialize the app
function init() {
  loadTasksFromLocalStorage();
  renderTasks();
  setupEventListeners();
}

// Setup Event Listeners
function setupEventListeners() {
  // Add task
  addTaskBtn.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });

  // Task actions (using event delegation)
  tasksList.addEventListener("click", handleTaskActions);

  // Filters
  filterSelect.addEventListener("change", renderTasks);
  filterCategory.addEventListener("change", renderTasks);
  clearCompletedBtn.addEventListener("click", clearCompletedTasks);

  // Modal
  closeModal.addEventListener("click", closeEditModal);
  saveTaskBtn.addEventListener("click", saveEditedTask);
  window.addEventListener("click", (e) => {
    if (e.target === editTaskModal) closeEditModal();
  });
}

// Add a new task
function addTask() {
  const taskText = taskInput.value.trim();
  const category = categorySelect.value;

  if (taskText === "") return;

  const newTask = {
    id: Date.now().toString(),
    text: taskText,
    category: category,
    completed: false,
    date: new Date().toLocaleDateString(),
  };

  tasks.unshift(newTask); // Add to beginning of array
  saveTasksToLocalStorage();
  renderTasks();

  // Reset input
  taskInput.value = "";
  taskInput.focus();
}

// Handle task actions (complete, edit, delete)
function handleTaskActions(e) {
  const taskItem = e.target.closest(".task-item");
  if (!taskItem) return;

  const taskId = taskItem.dataset.id;

  // Handle checkbox
  if (e.target.classList.contains("task-checkbox")) {
    toggleTaskCompletion(taskId);
  }

  // Handle edit button
  if (
    e.target.classList.contains("edit-btn") ||
    e.target.closest(".edit-btn")
  ) {
    openEditModal(taskId);
  }

  // Handle delete button
  if (
    e.target.classList.contains("delete-btn") ||
    e.target.closest(".delete-btn")
  ) {
    deleteTask(taskId);
  }
}

// Toggle task completion status
function toggleTaskCompletion(taskId) {
  const taskIndex = tasks.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    tasks[taskIndex].completed = !tasks[taskIndex].completed;
    saveTasksToLocalStorage();
    renderTasks();
  }
}

// Delete a task
function deleteTask(taskId) {
  tasks = tasks.filter((task) => task.id !== taskId);
  saveTasksToLocalStorage();
  renderTasks();
}

// Clear all completed tasks
function clearCompletedTasks() {
  tasks = tasks.filter((task) => !task.completed);
  saveTasksToLocalStorage();
  renderTasks();
}

// Open edit modal
function openEditModal(taskId) {
  const task = tasks.find((task) => task.id === taskId);
  if (!task) return;

  currentEditId = taskId;
  editTaskInput.value = task.text;
  editCategorySelect.value = task.category;

  editTaskModal.style.display = "flex";
}

// Close edit modal
function closeEditModal() {
  editTaskModal.style.display = "none";
  currentEditId = null;
}

// Save edited task
function saveEditedTask() {
  if (!currentEditId) return;

  const taskText = editTaskInput.value.trim();
  const category = editCategorySelect.value;

  if (taskText === "") return;

  const taskIndex = tasks.findIndex((task) => task.id === currentEditId);
  if (taskIndex !== -1) {
    tasks[taskIndex].text = taskText;
    tasks[taskIndex].category = category;
    saveTasksToLocalStorage();
    renderTasks();
  }

  closeEditModal();
}

// Render tasks based on current filters
function renderTasks() {
  const filterValue = filterSelect.value;
  const categoryValue = filterCategory.value;

  // Apply filters
  let filteredTasks = tasks.filter((task) => {
    // Filter by completion status
    if (filterValue === "completed" && !task.completed) return false;
    if (filterValue === "active" && task.completed) return false;

    // Filter by category
    if (categoryValue !== "all" && task.category !== categoryValue)
      return false;

    return true;
  });

  // Clear current list
  tasksList.innerHTML = "";

  // Update task count
  taskCount.textContent = filteredTasks.length;

  // Show/hide empty state
  if (filteredTasks.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";

    // Render each task
    filteredTasks.forEach((task) => {
      const taskElement = createTaskElement(task);
      tasksList.appendChild(taskElement);
    });
  }
}

// Create a task element from template
function createTaskElement(task) {
  const taskClone = document.importNode(taskTemplate.content, true);
  const taskItem = taskClone.querySelector(".task-item");

  // Set task data
  taskItem.dataset.id = task.id;
  if (task.completed) taskItem.classList.add("completed");

  // Set task content
  const taskText = taskClone.querySelector(".task-text");
  const taskCategory = taskClone.querySelector(".task-category");
  const taskDate = taskClone.querySelector(".task-date");
  const taskCheckbox = taskClone.querySelector(".task-checkbox");

  taskText.textContent = task.text;
  taskCategory.textContent =
    task.category.charAt(0).toUpperCase() + task.category.slice(1);
  taskCategory.dataset.category = task.category;
  taskDate.textContent = task.date;
  taskCheckbox.checked = task.completed;

  return taskItem;
}

// Local Storage Functions
function saveTasksToLocalStorage() {
  localStorage.setItem("taskmasterTasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  const storedTasks = localStorage.getItem("taskmasterTasks");
  if (storedTasks) {
    tasks = JSON.parse(storedTasks);
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
