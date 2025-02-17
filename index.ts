import axios from "axios";
import fs from "fs/promises";
import dotenv from "dotenv";

dotenv.config();

const API_TOKEN = process.env.WRIKE_API_TOKEN;
const BASE_URL = "https://www.wrike.com/api/v4";

if (!API_TOKEN) {
  console.error("Error: Missing Wrike API token in .env file");
  process.exit(1);
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  profiles: { email?: string }[];
}

interface Task {
  id: string;
  title: string;
  status: string;
  parentIds?: string[];
  responsibleIds?: string[];
  createdDate: string;
  updatedDate: string;
  permalink: string;
}

interface Folder {
  id: string;
  title: string;
  scope: string;
}

interface StructuredTask {
  id: string;
  title: string;
  status: string;
  createdDate: string;
  updatedDate: string;
  permalink: string;
  assignees: { id: string; name: string; email?: string }[];
}

interface StructuredFolder {
  id: string;
  title: string;
  scope: string;
  tasks: StructuredTask[];
}

async function fetchData<T>(endpoint: string, params: string = ""): Promise<T[]> {
  const response = await axios.get(`${BASE_URL}/${endpoint}${params}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
  });
  return response.data.data;
}

async function saveToFile(filename: string, data: unknown): Promise<void> {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    console.log(`${filename} file saved successfully!`);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}

async function fetchAndProcessData(): Promise<void> {
  const [folders, tasks, contacts] = await Promise.all([
    fetchData<Folder>("folders"),
    fetchData<Task>("tasks", '?fields=["parentIds","responsibleIds"]'),
    fetchData<Contact>("contacts"),
  ]);

  const contactsMap = new Map<string, { id: string; name: string; email?: string }>(
    contacts.map(contact => [
      contact.id,
      {
        id: contact.id,
        name: `${contact.firstName} ${contact.lastName}`,
        email: contact.profiles[0]?.email,
      },
    ])
  );

  const parentIdMap = new Map<string, StructuredTask[]>();

  tasks.forEach(task => {
    const structuredTask: StructuredTask = {
      id: task.id,
      title: task.title,
      status: task.status,
      createdDate: task.createdDate,
      updatedDate: task.updatedDate,
      permalink: task.permalink,
      assignees: (task.responsibleIds || [])
        .map(id => contactsMap.get(id))
        .filter(Boolean) as { id: string; name: string; email?: string }[],
    };

    task.parentIds?.forEach(parentId => {
      if (!parentIdMap.has(parentId)) {
        parentIdMap.set(parentId, []);
      }
      parentIdMap.get(parentId)?.push(structuredTask);
    });
  });

  const structuredData: StructuredFolder[] = folders.map(folder => ({
    id: folder.id,
    title: folder.title,
    scope: folder.scope,
    tasks: parentIdMap.get(folder.id) || [],
  }));

  await saveToFile("data.json", structuredData);
}

async function main(): Promise<void> {
  await fetchAndProcessData();
}

main();
