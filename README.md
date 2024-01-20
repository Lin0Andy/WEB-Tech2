# Weather and News Dashboard

A web application that provides real-time weather information, latest news, and air quality data for a specified city.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [API Usage](#api-usage)
- [Design Decisions](#design-decisions)

## Introduction

This web application integrates weather information, latest news, and air quality data to provide users with a comprehensive overview of a specified city. It fetches data from multiple APIs to present relevant and up-to-date information.

## Features

- **Weather Information:** Get real-time weather updates, including temperature, humidity, and wind speed.
- **Latest News:** Stay informed with the latest news articles related to a specific topic.
- **Air Quality:** Check the air quality index (AQI) and concentration levels of different pollutants.

## Setup Instructions

Follow these steps to set up and run the application:

1. Clone this repository
   
2. Install dependencies:
  - cd assignment2
  - npm install

3. Create environment variables:
  - Create a .env file in the root directory and add the following variables:
    - WEATHER_API_KEY=your_weather_api_key
    - NEWS_API_KEY=your_news_api_key
    - THIRD_API_KEY=your_air_quality_api_key
  - Replace your_weather_api_key, your_news_api_key, and your_third_api_key with your actual API keys.

4 Run the application:
  nodemon app.js
  The application will be accessible at http://localhost:3000.

## API Usage
The application uses the following APIs:

- **OpenWeatherMap API**: For weather information.
- **News API**: For fetching latest news articles.
- **Air Quality API**: For obtaining air quality data.

Ensure you have valid API keys and set them in the .env file.

## Design Decisions
**Frontend**
- _Bootstrap_: Utilized Bootstrap for responsive and clean UI design.
- _Pug_: Used Pug as the template engine for HTML markup.
**Backend**
- _Node.js_: Chose Node.js for server-side development due to its non-blocking nature.
- _Express_: Used Express.js as the web application framework for Node.js.
- _Request Module_: Utilized the request module for making HTTP requests to external APIs.

