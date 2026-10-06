# Calculator Frontend

## Project Overview

This is the frontend of my EE308 calculator project. It uses HTML, CSS and JavaScript. The frontend sends requests to the Java backend and shows the results. It does not calculate answers itself.

[Backend repository](https://github.com/easonwang815/832402120_calculator_backend)

## Features

- Basic arithmetic, brackets, decimals and negative numbers
- Powers, square roots, sin, cos and tan
- Calculation history, search, pages and deletion
- Conversion between base 2, 8, 10 and 16
- Keyboard input: Enter to calculate, Backspace to delete and Escape to clear

## Project Structure

- `index.html`: the calculator page
- `css/style.css`: page styles
- `js/api.js`: requests to the backend
- `js/app.js`: buttons, results and history
- [`codestyle.md`](codestyle.md): the code style used in this project

## Requirements

Use a modern browser and Python 3. To run the whole project locally, the backend also needs Java 17 and Maven 3.9.

## How to Run

Place the frontend and backend folders in the same parent folder.

In the first terminal, start the backend from the parent folder:

~~~bash
cd 832402120_calculator_backend
mvn spring-boot:run
~~~

In a second terminal, start the frontend from the same parent folder:

~~~bash
cd 832402120_calculator_frontend
python3 -m http.server 8000
~~~

Open [http://localhost:8000/](http://localhost:8000/) in your browser. Type `1+2` and press Enter. The result should be `3`, and it should appear in the history.

Keep both terminals running. Press Ctrl+C in each terminal to stop the project.

## Online Demo

[Open the calculator](http://47.98.182.108/)

The frontend and backend run on one Alibaba Cloud server in Hangzhou. The frontend uses `/api` to contact the backend. The server trial ends on November 6, 2026.

This demo uses HTTP and shares history between visitors. Please do not enter private information.
