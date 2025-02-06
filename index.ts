import axios from 'axios';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const API_TOKEN = process.env.WRIKE_API_TOKEN;

if (!API_TOKEN) {
  console.error(" Error: Missing Wrike API token in .env file");
  process.exit(1);
}

const WRIKE_API_URL = 'https://www.wrike.com/api/v4/tasks?fields=["parentIds"]';


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

const saveTasksToFile = async (): Promise<void> => {
  try {
    const tasks = await fetchTasks();

    if (tasks.length === 0) {
      console.log("No tasks found!");
      return;
    }

    const jsonData = JSON.stringify(tasks, null, 2);

    await new Promise<void>((resolve, reject) => {
      fs.writeFile('tasks.json', jsonData, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('Mapped tasks saved to tasks.json');
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("Error saving tasks to file:", error);
  }
};

saveTasksToFile();




const WRIKE_API_URL_ADDRESS = "https://www.wrike.com/api/v4";

interface Contact {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    type: string;
}

interface Folder {
    id: string;
    title: string;
    scope: string;
    childIds?: string[];
}

const writeToFile = (fileName: string, data: any): Promise<void> => {
    return new Promise((resolve, reject) => {
        fs.writeFile(fileName, JSON.stringify(data, null, 2), "utf8", (err) => {
            if (err) {
                reject(`Error writing ${fileName}: ${err.message}`);
            } else {
                console.log(` ${fileName} successfully saved!`);
                resolve();
            }
        });
    });
};


const fetchContacts = async (): Promise<Contact[]> => {
    try {
        const response = await axios.get(`${WRIKE_API_URL_ADDRESS}/contacts`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
        });

        return response.data.data.map((contact: any) => ({
            id: contact.id,
            firstName: contact.firstName,
            lastName: contact.lastName,
            email: contact.profiles[0]?.email || " ",
            type: contact.type,
        }));
    } catch (error) {
        console.error(" Error fetching contacts:", error.message);
        return [];
    }
};


const fetchFolders = async (): Promise<Folder[]> => {
    try {
        const response = await axios.get(`${WRIKE_API_URL_ADDRESS}/folders`, {
            headers: { Authorization: `Bearer ${API_TOKEN}` },
        });

        return response.data.data.map((folder: any) => ({
            id: folder.id,
            title: folder.title,
            scope: folder.scope,
            childIds: folder.childIds || [],
        }));
    } catch (error) {
        console.error(" Error fetching folders:", error.message);
        return [];
    }
};

const main = async () => {
    try {
        const [contacts, folders] = await Promise.all([
            fetchContacts(),
            fetchFolders(),
        ]);

        await Promise.all([
            writeToFile("contacts.json", contacts),
            writeToFile("folders.json", folders),
        ]);

        console.log(" All files successfully created!");
    } catch (error) {
        console.error(" Error in main function:", error);
    }
};


main();
