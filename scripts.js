let timer = null;
let startTime = null;
let elapsedTime = 0;

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => {
        sec.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
}

function startTimer() {
    if (timer) return;
    startTime = new Date();
    timer = setInterval(updateTimerDisplay, 1000);
}

function stopTimer() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    const endTime = new Date();
    const activityName = document.getElementById('activityName').value || 'Unnamed Task';
    logEvent(activityName, startTime, endTime);
    updateLogsDisplay();
}

function updateTimerDisplay() {
    const now = new Date();
    elapsedTime = now - startTime;
    const totalSeconds = Math.floor(elapsedTime / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds}`;
}

function logManualEvent() {
    const activityName = document.getElementById('manualActivityName').value;
    const start = new Date(document.getElementById('startTime').value);
    const end = new Date(document.getElementById('endTime').value);
    logEvent(activityName, start, end);
    updateLogsDisplay();
}

function logEvent(activityName, start, end) {
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    logs.push({ activityName, startTime: start, endTime: end });
    localStorage.setItem('logs', JSON.stringify(logs));
}

function updateLogsDisplay() {
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    const logList = document.getElementById('logList');
    logList.innerHTML = ''; // Clear existing entries

    logs.forEach((log, index) => {
        const li = document.createElement('li');
        li.textContent = `${log.activityName}: ${new Date(log.startTime).toLocaleString()} - ${new Date(log.endTime).toLocaleString()}`;
        
        // Create a delete button for each log
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = function() { deleteLog(index); }; // Pass index to delete function
        deleteBtn.style.marginLeft = '10px'; // Some styling for the button

        li.appendChild(deleteBtn);
        logList.appendChild(li);
    });
}

function deleteLog(index) {
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    logs.splice(index, 1); // Remove the log at the specified index
    localStorage.setItem('logs', JSON.stringify(logs)); // Update localStorage with the new array
    updateLogsDisplay(); // Refresh the display
}




// Function to calculate the weekly summary with task breakdown
function generateWeeklySummary() {
    const logs = JSON.parse(localStorage.getItem('logs')) || [];
    const taskData = {}; // Store duration per task per day
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#C9CBCF']; // Colors for different tasks

    logs.forEach(log => {
        const activityName = log.activityName;
        const startTime = new Date(log.startTime);
        const endTime = new Date(log.endTime);
        const duration = (endTime - startTime) / 3600000; // Convert milliseconds to hours
        const dayOfWeek = startTime.getDay();

        if (!taskData[activityName]) {
            taskData[activityName] = Array(7).fill(0);
        }
        taskData[activityName][dayOfWeek] += duration;
    });

    const datasets = Object.keys(taskData).map((task, index) => ({
        label: task,
        data: taskData[task],
        backgroundColor: colors[index % colors.length], // Cycle through colors
        borderColor: colors[index % colors.length],
        borderWidth: 1
    }));

    const ctx = document.getElementById('summaryChart').getContext('2d');
    if (window.myBarChart) {
        window.myBarChart.destroy();
    }
    window.myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: daysOfWeek,
            datasets: datasets
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    stacked: true // Stack bars for different tasks on the same day
                }
            },
            responsive: true,
            plugins: {
                legend: {
                    display: true, // Display legend
                    position: 'top'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(sec => {
        sec.style.display = 'none';
    });
    document.getElementById(sectionId).style.display = 'block';
    if (sectionId === 'summary') {
        generateWeeklySummary();
    }
}

document.addEventListener('DOMContentLoaded', updateLogsDisplay);
