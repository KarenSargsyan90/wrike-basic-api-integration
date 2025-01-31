Wrike Tasks Integration

This project integrates with the Wrike API to fetch tasks, process them, and save the data into a tasks.json file in the desired format.

Features

Fetch tasks from Wrike using their API.
Process the tasks to ensure undefined fields are handled gracefully.
Save tasks in a structured tasks.json file.
Written in TypeScript for better type safety and maintainability.
Requirements
Before running this project, ensure you have the following installed:

Node.js (Version 20 or 22 recommended)
npm (Comes with Node.js)
TypeScript (npm install -g typescript)
Git

Setup Instructions

1. Clone the Repository
git clone https://github.com/KarenSargsyan90/wrike-basic-api-integration.git  
cd wrike-basic-api-integration  

2. Install Dependencies
Run the following command to install all required dependencies:
npm install  

3. Create a Wrike API App
Log in to your Wrike account.
Go to the Wrike API Apps page.
Create a new API app with the necessary permissions to fetch tasks.
Generate a Permanent Access Token and copy it.

Configuration
  
Add your Wrike Access Token to the .env file:
WRIKE_ACCESS_TOKEN=your_access_token_here  

How to Run

1. If you're using TypeScript, run:

npx ts-node index.ts

2. Or if you have npm start configured

npm start 

Expected Output
 
A tasks.json file will be created in the root directory.
The file will contain all the tasks fetched from Wrike in the following format:

[  
  {  
    "id": "task_id",  
    "title": "Task Title",  
    "responsibles": ["User1", "User2"],  
    "status": "Active",  
    "parentIds": ["parent_id"],  
    "createdDate": "2025-01-01T00:00:00Z",  
    "updatedDate": "2025-01-02T00:00:00Z",  
    "permalink": "https://www.wrike.com/open.htm?id=task_id"  
  }  
]  

Additional Notes

If responsibles or parentIds are undefined, they will be replaced with an empty array ([]).
If a field is missing, it will be replaced with an empty string ("") to ensure consistent formatting.
Development Tips
Use Postman to test Wrike API responses before coding.
Commit your changes daily to GitHub to track progress:

git add .  
git commit -m "Your message here"  
git push  

Check your network connection.
Test the API endpoint with Postman to ensure it is accessible.
Technologies Used
TypeScript: For type-safe, maintainable code.
Node.js: To execute the script.
Wrike API: For task management integration.
Author
Developed by **Karen Sargsyan**.



