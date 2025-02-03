<h1 align="center">ChattersApp<br></h1>
<h3 align="center">A minimal chatting app built using MERN stack</h3>

<p align="center">
<img src="https://img.shields.io/github/stars/RatndeepChavan/ChattersApp" alt="Stars">
<img src="https://img.shields.io/github/forks/RatndeepChavan/ChattersApp" alt="Forks">
<img src="https://img.shields.io/github/issues/RatndeepChavan/ChattersApp" alt="Issues"><br>
<a href="http://commitizen.github.io/cz-cli/">
<img src="https://img.shields.io/badge/commitizen-friendly-brightgreen" alt="Commitizen">
</a>
<a href="https://lerna.js.org/">
<img src="https://img.shields.io/badge/maintained%20with-lerna-cc00ff" alt="Commitizen">
</a>
<a href="https://www.jsdocs.io/package/docdash"><img src="https://img.shields.io/badge/documentation-JsDoc-blue" alt="jsDocs.io"></a>
</p>

<div align="center">
  <a href="#about">About</a> •
  <a href="#code-analysis">Cade Analysis</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#repo-structure">Repo Structure</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#er-diagram">ER Diagram</a> 
</div>

# About
A simple chat app which allows user to **chat in real time**. Well password is necessary to sign up but once email/mobile is verified **user can also use otp to login**. Conversation **request can be initiated max 5 times** (including both user) and afterwards it'll blocked considering malicious request. Count of **unread text as well as new chat notification will be handle in real time** for smooth user experience. For Continues Integration and deployment please refer [ChattersApp_CI](https://github.com/RatndeepChavan/ChattersApp_CI) and [ChattersApp_CD](https://github.com/RatndeepChavan/ChattersApp_CD) repositories respectively. This app uses following technologies:

- **Programming language:**

  ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)

- **Frontend:**
  
  ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![shadcn/ui Badge](https://img.shields.io/badge/shadcn%2Fui-000?logo=shadcnui&logoColor=fff&style=for-the-badge)

- **Backend:**
  
  ![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white) ![SendGrid Badge](https://img.shields.io/badge/SendGrid-51A9E3?logo=sendgrid&logoColor=fff&style=for-the-badge) ![Twilio Badge](https://img.shields.io/badge/Twilio-F22F46?logo=twilio&logoColor=fff&style=for-the-badge) 

- **Database:**
  
  ![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)

- **Version control:**
  
  ![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
  ![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)

- **Deployment:**
  
  ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white) ![Nginx](https://img.shields.io/badge/nginx-%23009639.svg?style=for-the-badge&logo=nginx&logoColor=white)

# Code Analysis:
- All code is **readable and maintainable** with **proper file structuring** and in depth **documentation using `jsdoc and docdash`**.
- User can use **OTP based login** only after **email/mobile verification** is complete.
- For security using **`rate limiting`** so only **three otp within 30 seconds** are allowed.
- For **each OTP unique secret** is generated which is **valid for 30 seconds**.
- **Authentication is handle `jwt` access token and refresh token using `middleware`.**
- For security **password is encrypted** while saving user's data. 
- App supports **`dark and light`** mode as per user preference.
- Notification for new chat requested, accepted, rejected or blocked is **handle and updated in real time using `socket`**.
- User can **search any user** by username and send request to chat. Sending request only **allowed max 5 times**. (including both users)
- For smooth messaging, messages are fetched in **`reverse paginated query`** (i.e from bottom to top) and **older message will be fetch when user scrolls upwards** using **`lazy loading`**.
- While scrolling upward for old messages user's **scroll positioning is maintained** but if user receives new text then **focus shifted to new message** by prioritizing the new text.
- **New notification are denoted by red dot** on bell icon and can be open on clicking bell icon and closed by 'X' icon.
- By manually clicking logout user can logout from app else user can **login automatically in same browser within 24 hours** from last login.
- This repository includes *both frontend and backend code as client and server* packages respectively and **managed by `lerna` monolithic repository norms**.
- All backend api activity will **log in terminal and also updated in log folder all.log file** using the string structure define in **`winston and morgan configuration`**.
- To handle errors and keep track of then **error log will be updated in logs folder error.log file** along with all.log file
- To optimize data fetching **`custom database indexes`** are created for various models.
- For deployment considering the factors like **performance, optimization, security, efficiency** etc I've use **`multistage dockerization with distroless docker images`**.


# Repo Structure :
For code readability and maintainability with discipline coding this github repository follows following branching structure and rules.
- **dev/developer** : This is developer specific brach where developer can commit anytime freely. Commit hook checks lining and best practices for code push on this brach.
- **development** : In this branch all developers code get merge. This branch tracks development process and allows developer for send and share. Commit hook performs test cases and checks code coverage before pushing code.
- **production** : This is live production brach and direct commit to this branch is restricted. Developer must generate PR from development branch (which get reviewed by seniors) to commit on this brach.
- **master** : This brach is work as back-up brach for emergency and easy rollback. This brach is also is restricted must generate PR to commit on this brach

**`NOTE :`** This repository is set up using pre-commit hooks to follow conventional commit. Please use `git cz commit` to get conventional commit options.


# How to use:
- Get the code (download, clone, fork whichever you prefer)
- Create .env files for client and server using reference of .env.sample (for non-sensitive values please refer frontend-configmap.yml and backend-configmap.yml files from chattersapp CD repo.) 
- Run following commands in terminal for local development set up:
  ```bash
  # Use cd and set terminal path to root folder 
  npm install # install require packages same as npm i

  # Starting server
  cd /packages/server # change to server folder
  npm run dev # start server

  # open another terminal

  # Starting client
  cd /packages/client # change to server folder
  npm run dev # for client (frontend)

  # open the link in you preferred browser
  ```

# Deployment:
As per fullstack developer view point deployment is solely focused on docker. Considering the factors like performance, optimization, security, efficiency etc I've use **`multistage dockerization with distroless docker images`** for deployment. This repository includes three type of deployment files which can be run using docker compose.
### deployment-local.yml
- This file implements a local deployment using docker. This is useful to verify development changes are working in production environment.
- To use this deployment first update .env files and start docker to work with docker. 
- Then as per project folder structure open new terminal in packages folder and run below command.
  ```bash
  # Check your docker and docker-compose are install and running by following commands
  # docker -v           # alternatively docker --version
  # docker-compose -v   # alternatively docker-compose --version
  
  # Start docker container
  docker-compose -f deployment-local.yml up --build -d
  # -d is for detach terminal you can skip it if you want to observe logs.
  
  # For build only
  # docker-compose -f deployment-local.yml build
  
  # To run using previous build
  # docker-compose -f deployment-local.yml up -d  
  ```

### deployment-simple.yml
- This is simple dockerized deployment to make your app public avoiding devops pipeline.
- To make it public first push your images in image repository and set up server instance (like aws ec2 instance) with public it and/or dns.
- Log in to instance terminal and create "client.env", "server.env" and "compose.yml" using 
  ``` bash
  touch client.env server.env compose.yml
  ```
- Update this file like env.sample files for client and server using editor. (e.g. vim, nano)
- Copy content of deployment-simple.yml to newly created compose.yml file.
- Run the following commands in sequence:
  ``` bash
  # Update packages and their versions.
  sudo apt-get update && sudo apt-get upgrade -y

  # Install Docker
  sudo apt-get install -y docker.io
  sudo apt-get update

  # Install docker compose plugin
  sudo apt install -y docker-compose
  sudo apt-get update

  # Add current user to docker group and refresh
  sudo usermod -aG docker $USER && newgrp docker
  
  # To verify use following commands
  # docker -v           # alternatively docker --version
  # docker-compose -v   # alternatively docker-compose --version
  # docker ps           # To verify user has permission to use docker
  
  # Start docker container
  docker-compose up --build -d
  # -d is for detach terminal you can skip it if you want to observe logs.   
  ```
- Your app is up and running at port 3000 as public visit using *http://<instance public dns/ip>:3000*

### deployment-simple.yml
- This is the minimalistic code just to build images and meant use in jenkins pipeline.
- After code analysis and tests jenkins will use this file to build images for code.
- For in depth devops related deployment please visit my [continuous integration (CI)](https://github.com/RatndeepChavan/ChattersApp_CI) and [continuous deployment (CD)](https://github.com/RatndeepChavan/ChattersApp_CD) repos.

# ER Diagram:

![alt text](ERDiagram.svg)
