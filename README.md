 TaskFlow Pro — TO-DO LIST APPLICATION

TaskFlow Pro is a high-performance, feature-rich task management dashboard built using modern vanilla web technologies. Designed with a mobile-first, high-contrast user experience, it serves as a comprehensive tool to help users organize daily activities efficiently while keeping data locally secure and accessible.

 ✨ Core Features & Functionality

*   **Robust CRUD Operations:** Add, view, edit, and delete tasks seamlessly with state persistence.
*   **Strict Form Validation:** Inline criteria tracking to prevent empty or invalid submissions.
*   **Interactive Status Toggles:** Mark tasks as pending or completed with instant visual feedback.
*   **Dynamic Metrics Dashboard:** Real-time counters calculating Total, Completed, and Pending items.
*   **Omni-Search & Multi-Filtering:** Real-time search by title alongside parallel filtering by category and completion status.
*   **Local Storage Architecture:** Complete data serialization ensuring zero data loss after a browser refresh.

 🌟 Advanced Showcase Features (Bonus Implementations)
*   **Dynamic Progress Tracking:** An interactive, fluidly animated CSS progress bar reflecting current completion percentages.
*   **Recruiter-Level Sorting Matrix:** Custom sorting engine prioritizing Overdue tasks first, followed by strict uncompleted chronological deadlines, and then High-to-Low priority weights.
*   **Contextual Overdue Flags:** Automated system date evaluation engine highlighting tasks past their deadlines with an explicit `⚠️ OVERDUE` badge.
*   **Data Portability Utilities:** Built-in tools to **Export** your task list as a clean `.json` backup file or **Import** an existing backup to instantly restore application states.
*   **Dual Thematic Layouts:** Native Light and Dark mode engine with system configuration mapping and theme persistence.


 🛠️ Tech Stack & Architecture

This application was intentionally built **without heavy framework dependencies (like React or Vue)** to demonstrate absolute mastery over native core frontend engineering principles:

*   **HTML5:** Structured using clean, semantic tags (`<header>`, `<main>`, `<form>`, `<select>`) to support accessibility and proper DOM hierarchy.
*   **CSS3:** Modeled around a mobile-first philosophy using modern **CSS Grid** and **Flexbox** models. Styled using custom dynamic variable properties (`--primary`, `--bg-surface`) to support fluid light/dark mode transitions.
*   **JavaScript (ES6+):** Pure functional architecture implementing clean event listeners, local array mutations, and robust object serialization.


🔒 Production-Grade Engineering Practices

To make this project stand out from typical tutorial implementations, the following professional methodologies were used:
1.  **Security Architecture (Anti-XSS):** Includes a custom string-sanitization layer (`escapeHTML`) that encodes unsafe characters, mitigating potential Cross-Site Scripting (XSS) input vulnerabilities.
2.  **Performance Optimization (Debouncing):** The text search mechanism utilizes a `300ms` debounce timer delay, preventing performance drops and browser layout lagging during high-frequency typing.
3.  **Mobile Target Accessibility Compliance:** Configured inputs with a minimum touch-target size of `44px × 44px` to eliminate accidental thumb clicks, wrapped hover states in an interaction media query (`@media (hover: hover)`) to bypass sticky mobile styling bugs, and strictly calibrated text rules to block unwanted mobile page zooming.


 📂 Project Architecture

|
todo-app/
│
├── index.html     # Application interface structure and markup configurations
├── style.css      # Core styles, responsiveness breakdowns, and color token sheets
├── script.js     # State engine, dynamic filters, data portability, and DOM rendering
└── README.md      # Comprehensive system engineering breakdown documentation
