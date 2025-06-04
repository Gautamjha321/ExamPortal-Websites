# 🎓 ExamPortal – AI-Powered Online Examination System

A full-stack intelligent online exam platform with advanced proctoring, AI-generated questions, bulk question uploads via CSV, and anti-cheating mechanisms.

---

## 🛠️ Tech Stack

- **Frontend**: Angular 15, Angular Material, CKEditor, ngx-ui-loader, Webcam API
- **Backend**: Java Spring Boot, REST APIs, JWT Auth
- **Database**: MySQL
- **AI Integration**: Gemini API (Google AI) for automatic question generation

---

## 🚀 Features

### 👨‍💼 Admin Panel
- 🔄 **One-click CSV Upload**: Add multiple quiz questions via CSV file.
- 🧠 **AI-Powered Question Generator**: Generate quiz questions using Gemini AI.
- 🧩 Quiz Management: Create, update, delete quizzes and categories.
- 📈 View Quiz Attempts with user scorecards.
- 🧑‍💼 User Management with Role-Based Access.

### 👨‍🎓 User Panel
- 🔐 JWT Authentication (Login / Signup).
- 📝 Attempt Quizzes with a clean, responsive UI.
- 📸 **Real-time Camera Monitoring** during exam sessions.
- 🚫 **Tab-Switch Detection**:
  - Warning on every switch.
  - Auto-submits after 5 switches.
- ✅ Auto Result Calculation & Display.
- 🖨️ **Printable Result**: Download or print quiz results.

---

## 🧠 AI Question Generation (Gemini API)

Admin can enter a topic and generate intelligent questions and answers automatically using Google Gemini API. This accelerates exam creation and reduces manual effort.

---

## 📂 Bulk Upload via CSV

Admin can upload questions for any quiz using a CSV file containing fields like:
- Question Content
- Options
- Correct Answer
- Quiz ID or Category

Example CSV Format:
```csv
questionContent,option1,option2,option3,option4,answer,quizId
"What is Angular?", "Framework", "Library", "Language", "IDE", "Framework", 1

🛡️ Anti-Cheating System
Real-time webcam access during the quiz.

Tab switching detection using JavaScript.

5 warnings allowed – 6th switch auto-submits the exam.

Secure backend with token verification.

cd examportal
npm install
ng serve


🔑 Environment Config
application.properties (Spring Boot)
properties
Copy
Edit
spring.datasource.url=jdbc:mysql://localhost:3306/examportal
spring.datasource.username=root
spring.datasource.password=your_password
jwt.secret=your_secret_key

🔗 Screenshots
Dashboard	Quiz Page	AI Question Generator	Camera Monitoring

🤝 Contributing
Contributions are welcome!
Create a new branch, commit your changes, and open a PR.

📄 License
This project is licensed under the MIT License.

✨ Author
Gautam Kumar Jha
Developer | Full Stack Engineer | AI Enthusiast


---

Let me know if you want:
- Markdown with working folder structure.
- Images added to the `/screenshots/` folder.
- Deployed link / Live demo badge section.
- Separate `.csv` file for question upload sample.
