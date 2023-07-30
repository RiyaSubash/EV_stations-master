
# EV Charging Station Locator

### Introduction

Welcome to the "EV Charging Station Locator" project! This project aims to provide a web application that helps users locate electric vehicle (EV) charging stations in their vicinity using TomTom Maps API. This Readme file will guide you through the installation process and provide information about the software and APIs used in this project.

### Installation
To get started with the EV Charging Station Locator, follow the steps below:

1. Clone the repository from GitHub:
```
git clone https://github.com/tanmai22/EV-charging-station-locater.git
```

2. Change your current directory to the project folder:
```
cd EV-charging-station-locater
```

3. Install the required dependencies using npm (Node Package Manager):
```
npm install
```

### Software Used
The project utilizes the following software:

- Node.js: Node.js is a JavaScript runtime that allows us to run JavaScript code outside of a web browser. It is required to install project dependencies and run the development server.

- npm: npm is the package manager for Node.js. It is used to install and manage the project's dependencies.

- http-server: http-server is a simple, zero-configuration command-line HTTP server used to serve the web application.

- gh-pages: gh-pages is a npm package used to deploy the application to GitHub Pages.

### Scripts

The project includes the following npm scripts defined in the package.json file:

- npm start: This script starts the development server using http-server, allowing you to view the application in your web browser. You can access the application by navigating to http://localhost:8080.

- npm test: This script is a placeholder for running tests, but currently, no tests are specified in the project.

- npm run predeploy: This script is automatically executed before deploying the application to GitHub Pages. It runs the npm run build command to prepare the application for deployment.

- npm run deploy: This script is used to deploy the application to GitHub Pages using gh-pages. It will deploy the built application to the gh-pages branch of the repository, making it accessible through the provided URL.
