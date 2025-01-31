import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const API_TOKEN = process.env.WRIKE_API_TOKEN;

if (!API_TOKEN) {
  console.error(" Error: Missing Wrike API token in .env file");
  process.exit(1);
}

const WRIKE_API_URL = 'https://www.wrike.com/api/v4/tasks';


interface Task {
  id: string;
  name: string;
  status: string;
  responsibles: string[];
  parentIds: string[];
  created_at: string;
  updated_at: string;
  ticket_url: string;
}


const fetchTasks = async (): Promise<Task[]> => {
  try {
    const response = await axios.get(WRIKE_API_URL, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });

    const tasks = response.data.data;

    console.log(`Found ${tasks.length} tasks`);

    return tasks.map((task: any) => ({
      id: task.id,
      name: task.title,
      status: task.status,
      responsibles: task?.responsibles  ?? [],
      parentIds: task?.parentIds ??  [],
      created_at: task.createdDate,
      updated_at: task.updatedDate,
      ticket_url: task.permalink,
    }));
  } catch (error: any) {
    console.error('Error fetching tasks:', error.message);
    return [];
  }
};

const saveTasksToFile = async () => {
  const tasks = await fetchTasks();

  if (tasks.length === 0) {
    console.log("No tasks found!");
    return;
  }

  const jsonData = JSON.stringify(tasks, null, 2);

  fs.writeFile('tasks.json', jsonData, (err) => {
    if (err) {
      console.error('Error writing to tasks.json:', err);
    } else {
      console.log('Mapped tasks saved to tasks.json');
    }
  });
};

saveTasksToFile();
