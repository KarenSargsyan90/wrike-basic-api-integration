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

async function fetchData(endpoint: string, params: string = "") {
  try {
    const response = await axios.get(`${BASE_URL}/${endpoint}${params}`, {
      headers: { Authorization: `Bearer ${API_TOKEN}` },
    });
    return response.data.data;
  } catch (error: any) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return [];
  }
}

async function saveToFile(filename: string, data: any) {
  try {
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    console.log(`${filename} ֆայլը հաջողությամբ պահպանվեց!`);
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
  }
}

async function fetchAndSaveTasks() {
  const tasks = await fetchData("tasks", '?fields=["parentIds","responsibleIds"]');
  const formattedTasks = tasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    parentIds: task.parentIds || [],
    responsibles: task.responsibleIds || [],
    createdDate: task.createdDate,
    updatedDate: task.updatedDate,
    permalink: task.permalink,
  }));
  await saveToFile("tasks.json", formattedTasks);
}

async function fetchAndSaveContacts() {
  const contacts = await fetchData("contacts");
  const formattedContacts = contacts.map((contact: any) => ({
    id: contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.profiles[0]?.email || " ",
    type: contact.type,
  }));
  await saveToFile("contacts.json", formattedContacts);
}

async function fetchAndSaveFolders() {
  const folders = await fetchData("folders");
  const formattedFolders = folders.map((folder: any) => ({
    id: folder.id,
    title: folder.title,
    scope: folder.scope,
    childIds: folder.childIds || [],
  }));
  await saveToFile("folders.json", formattedFolders);
}

async function main() {
  await Promise.all([
    fetchAndSaveTasks(),
    fetchAndSaveContacts(),
    fetchAndSaveFolders(),
  ]);
}

main();
