# 🎓 Student Management System

A simple and intuitive web application for managing student records. This application allows you to add, view, edit, and delete student information through an easy-to-use interface.

## ✨ Features

- **Add New Students**: Easily add student details including name, email, course, and more.
- **View Student List**: Browse through all student records in a clean table format.
- **Update Information**: Edit existing student details with just a few clicks.
- **Delete Records**: Remove student entries when needed.
- **Search & Filter**: Quickly find students by name, course, or year.
- **Clean Interface**: Simple and intuitive user interface for easy navigation.
- **Responsive Design**: Works smoothly on both desktop and mobile devices.

## 🚀 Getting Started

### Prerequisites

- Java 17 or higher
- Maven
- MySQL Server

### Installation

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd student-management-system
   ```

2. **Set up the database**:
   - Make sure MySQL is running
   - Create a new database:
     ```sql
     CREATE DATABASE student_management_db;
     ```

3. **Configure the application**:
   - Update the database credentials in `src/main/resources/application.properties` if needed

4. **Run the application**:
   ```bash
   mvn spring-boot:run
   ```

5. **Access the application**:
   Open your browser and go to: [http://localhost:8080](http://localhost:8080)

## 🖥️ Technologies Used

- **Backend**: Java 17, Spring Boot 3.2.0, Spring Data JPA
- **Frontend**: HTML5, CSS3, JavaScript, Bootstrap 5
- **Database**: MySQL
- **Build Tool**: Maven

## 📊 Project Structure

```
student-management-system/
├── src/
│   ├── main/
│   │   ├── java/com/studentmanagement/
│   │   │   ├── controller/    # Request handlers
│   │   │   ├── model/         # Data models
│   │   │   ├── repository/    # Database operations
│   │   │   ├── service/       # Business logic
│   │   │   └── StudentApplication.java  # Main application class
│   │   └── resources/
│   │       ├── static/        # Frontend files (JS, CSS, images)
│   │       └── application.properties  # Configuration
│   └── test/                  # Test files
└── pom.xml                    # Project dependencies
```

## 🛠️ Built With

- [Spring Boot](https://spring.io/projects/spring-boot) - Backend framework
- [Bootstrap 5](https://getbootstrap.com/) - Frontend styling
- [MySQL](https://www.mysql.com/) - Database
- [Maven](https://maven.apache.org/) - Dependency Management

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Bootstrap Icons](https://icons.getbootstrap.com/) for the clean icon set
- [Spring Initializr](https://start.spring.io/) for project bootstrapping
- All contributors who have helped shape this project

---

