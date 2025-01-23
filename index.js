require('dotenv').config();
const axios = require('axios');
const fs = require('fs');


const API_TOKEN = process.env.WRIKE_API_TOKEN;

if (!API_TOKEN) {
    console.error("Error: Missing Wrike API token in .env file");
    process.exit(1);
}


const WRIKE_API_URL = 'https://www.wrike.com/api/v4/tasks';


async function fetchTasks() {
    try {
        const response = await axios.get(WRIKE_API_URL, {
            headers: {
                Authorization: `Bearer ${API_TOKEN}`
            }
        });

        const tasks = response.data.data;
        console.log(`Found ${tasks.length} tasks`);
        return tasks;
    } catch (error) {
        console.error('Error fetching tasks:', error.message);
    }
}


function mapTasks(tasks) {
    return tasks.map(task => ({
        id: task.id,
        name: task.title,
        assignee: task.responsibles ? task.responsibles.join(', ') : 'N/A',
        status: task.status,
        collections: task.parentIds ? task.parentIds.join(', ') : 'N/A',
        created_at: task.createdDate,
        updated_at: task.updatedDate,
        ticket_url: task.permalink,
    }));
}


function saveTasksToFile(mappedTasks) {
    const jsonData = JSON.stringify(mappedTasks, null, 2);
    fs.writeFileSync('tasks.json', jsonData);
    console.log('Mapped tasks saved to tasks.json');
}


(async function main() {
    const tasks = await fetchTasks();
    if (tasks) {
        const mappedTasks = mapTasks(tasks);
        saveTasksToFile(mappedTasks);
    }
})();


