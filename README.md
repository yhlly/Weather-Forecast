# Weather-Forecast
System Requirements:
1. Node.js v18 or above
2. MySQL 8.0 or above
3. MySQL Workbench 8.0 or above

Database Setup:<br>
CREATE DATABASE weather_app;<br>
USE weather_app;<br>
CREATE TABLE weather_queries (<br>
  id INT AUTO_INCREMENT PRIMARY KEY,<br>
  location VARCHAR(255) NOT NULL,<br>
  start_date DATETIME NOT NULL,<br>
  end_date DATETIME NOT NULL,<br>
  weather_data JSON NOT NULL,<br>
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP<br>
);<br>

Installation Steps
1. Download repository
2. Install dependencies: npm install
3. Configure API keys in the file "backend/config/api-keys.js"
4. Configure password of database in the file "backend/index.js"
5. Run the application: npm start
6. Access the application in your browser: http://localhost:3000
