document.addEventListener('DOMContentLoaded', () => {
    const newTaskInput = document.getElementById('newTaskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const aiInsightElement = document.getElementById('aiInsight');
    const getInsightBtn = document.getElementById('getInsightBtn');

    let tasks = []; // { id: number, text: string, priority: 'High'|'Medium'|'Low' }

    // --- AI Simulation Data ---
    // In a real application, task prioritization and insights would come from a backend AI/ML model via API.
    const priorities = ['High', 'Medium', 'Low'];
    const aiInsights = [
        "Prioritize tasks that align with your long-term goals. Focus on impact, not just urgency.",
        "The Eisenhower Matrix: Urgent/Important, Not Urgent/Important, Urgent/Not Important, Not Urgent/Not Important.",
        "Break down large tasks into smaller, manageable steps to reduce overwhelm.",
        "Use the 'Two-Minute Rule': If a task takes less than two minutes, do it immediately.",
        "Review your priorities daily. What's truly essential for today?",
        "Avoid multitasking. Focus on one task at a time to improve quality and speed.",
        "Schedule 'deep work' blocks for your most important tasks, free from distractions.",
        "Delegate tasks when possible. Your time is valuable for high-impact activities.",
        "Take regular breaks to maintain focus and prevent burnout. The Pomodoro Technique can help.",
        "Learn to say 'no' to non-essential requests that don't align with your priorities."
    ];

    // --- Core Functions ---

    function assignPriority() {
        // Simulate AI prioritization: randomly assign a priority for demonstration.
        const randomIndex = Math.floor(Math.random() * priorities.length);
        return priorities[randomIndex];
    }

    function renderTasks() {
        taskList.innerHTML = ''; // Clear current tasks

        // Sort tasks: High > Medium > Low
        const sortedTasks = [...tasks].sort((a, b) => {
            const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });

        if (sortedTasks.length === 0) {
            taskList.innerHTML = '<p class="no-tasks">No tasks added yet. Start prioritizing!</p>';
            return;
        }

        sortedTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = `task-item priority-${task.priority.toLowerCase()}`;
            taskItem.innerHTML = `
                <span class="task-text">${task.text}</span>
                <span class="priority-tag priority-${task.priority.toLowerCase()}">${task.priority}</span>
            `;
            taskList.appendChild(taskItem);
        });
    }

    function addTask() {
        const taskText = newTaskInput.value.trim();
        if (taskText) {
            const priority = assignPriority(); // AI assigns priority (simulated)
            const newTask = {
                id: Date.now(), // Unique ID
                text: taskText,
                priority: priority
            };
            tasks.push(newTask);
            newTaskInput.value = ''; // Clear input
            renderTasks();
        } else {
            alert('Please enter a task!');
        }
    }

    function displayAiInsight() {
        const randomIndex = Math.floor(Math.random() * aiInsights.length);
        aiInsightElement.textContent = aiInsights[randomIndex];
    }

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);

    newTaskInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            addTask();
        }
    });

    getInsightBtn.addEventListener('click', displayAiInsight);

    // --- Initial Load ---
    renderTasks(); // Render any initial tasks (currently none)
    displayAiInsight(); // Display an initial insight
});
