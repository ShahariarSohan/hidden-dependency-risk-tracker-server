# 🛡️ Hidden Dependency Risk Tracker (HDRT)

Hidden Dependency Risk Tracker (HDRT) is a backend-driven risk analysis tool designed to help organizations proactively identify operational risks caused by excessive dependency on specific employees, teams, or critical systems.
Rather than discovering issues after delays or system failures occur, HDRT exposes risk patterns early by analyzing task ownership, system criticality, and workload distribution through structured data, measurable risk scores, and dashboard-ready insights.

## 🎯 Project Purpose

In many organizations:

- Critical systems depend on a few individuals
- Task overload remains invisible
- Risk surfaces only after delays or failures

**HDRT reduces this risk by tracking tasks, ownership, and system criticality in one place.**

---

## 🚀 MVP Features

- Role-based access (Admin, Manager, Employee)
- Team & system ownership modeling
- Risk calculation
- Dashboard-ready risk analytics APIs
- Admin can manage user,manager,employee,task,system,team
- Manager can manage task,team,add employee to a team.
- Soft-delete strategy to preserve historical data

---

## 🧠 Risk Calculation Logic

- `Task Risk = Task Priority × System Criticality`
- `Employee Risk = Sum of all active task risks`
- `Team Risk = Sum of employee risks within the team`
- `System Risk = Sum of active task risks linked to the system`

✅ Only `PENDING` and `IN_PROGRESS` tasks contribute to risk  
❌ `DONE` and `CANCELLED` tasks do not contribute

## 🛠 Tech Stack

- **Node.js**
- **TypeScript**
- **Express.js**
- **PostgreSQL**
- **Prisma ORM**
- **Zod Validation**
- **JWT Authentication**

---

## 📁 Project Structure

```
src/
┣ modules/
┃ ┣ auth/
┃ ┣ user/
┃ ┣ manager/
┃ ┣ employee/
┃ ┣ team/
┃ ┣ system/
┃ ┣ task/
┃ ┗ riskAnalysis/
┣ middlewares/
┣ shared/
┣ utils/
┣ config/
┗ app.ts
┗ server.ts
```
---

## 🔐 Authentication & Roles

### Roles

- `ADMIN`
- `MANAGER`
- `EMPLOYEE`

### Access Overview

| Action          | Admin | Manager | Employee |
| --------------- | ----- | ------- | -------- |
| Assign tasks    | ✅    | ✅      | ❌       |
| View dashboards | ✅    | ✅      | ❌       |
| View own tasks  | ✅    | ✅      | ✅       |
| Manage users    | ✅    | ❌      | ❌       |

---

## 🌐 Base API URL

/api/v1

---

## 🔑 Auth APIs

### Login

- `POST /api/v1/auth/login` --->Everyone
- `GET /api/v1/auth/me` --->Logged in user

---

## 👤 User APIs

- `GET /api/v1/user` --->Admin
- `GET /api/v1/user/me` --->Logged in user
- `GET /api/v1/user/:id` --->Admin
- `POST /api/v1/user/employee` --->Admin
- `POST /api/v1/user/manager` ---->Admin
- `PATCH /api/v1/user/update-my-profile` ---> Logged in user
- `PATCH /api/v1/user/status/:id` --->Admin

## 🧑‍💼 Manager APIs

- `GET /api/v1/manager` --->Admin
- `DELETE /api/v1/managers/soft-delete/:id` --->Admin
- 
✅ Manager deletion is a soft delete (isDeleted:true)


Supports pagination, filtering, searching, and sorting

---

## 🧑‍🔧 Employee APIs

- `GET /api/v1/employee` --->Admin
- `GET /api/v1/employee/:id` --->Admin
- `DELETE /api/v1/employee/soft-delete/:id` --->Admin
- `PATCH /api/v1/add-to-team/:employeeId` --->Admin

✅ Employee deletion is a soft delete (isDeleted:true)
---

## 👥 Team APIs

- `POST /api/v1/team` --->Admin,Manager
- `GET /api/v1/team` --->Admin
- `GET /api/v1/team/:id` --->Admin,Manager
- `PATCH /api/v1/team/status/:id` --->Admin,Manager
- `DELETE /api/v1/team/soft-delete/:id` --->Admin,Manager

✅ Team deletion is a soft delete (status = DELETED)
---

## 🖥️ System APIs

- `POST /api/v1/system` --->Admin
- `GET /api/v1/system` --->Admin
- `GET /api/v1/system/:id` --->Admin
- `PATCH /api/v1/system/status/:id` ---> Admin
- `DELETE /api/v1/system/soft-delete/:id` -->Admin

✅ System deletion is a soft delete (status = DELETED)
---

## ✅ Task APIs

- `POST /api/v1/task` --->Admin,Manager
- `GET /api/v1/tasks` --->Admin
- `GET /api/v1/tasks/:id` --->Admin,Manager
- `GET /api/v1/tasks/my-assigned-task` --->Admin,Manager,Employee
- `PATCH /api/v1/tasks/status/:id` --->Admin,Manager
- `DELETE /api/v1/task/soft-delete/:id` --->Admin,Manager

✅ Task cancellation is a soft delete (status = CANCELLED)

---

## 📊 Risk Analysis APIs (Core Feature)

### Risk Dashboard

- `GET /api/v1/riskAnalysis`  --->Admin

### Employee Risk

- `GET /api/v1/riskAnalysis/employee`  --->Admin
- `GET /api/v1/riskAnalysis/employee/:employeeId`  --->Admin

### Team Risk

- `GET /api/v1/riskAnalysis/team` --->Admin
- `GET /api/v1/riskAnalysis/team/:teamId`  --->Admin

### System Risk

- `GET /api/v1/riskAnalysis/system` --->Admin
- `GET /api/v1/riskAnalysis/system/:systemId`  --->Admin

---

## 📈 Risk Levels For Employee

| Score   | Level  |
| ------- | ------ |
| 0 – 15  | LOW    |
| 16 – 30 | MEDIUM |
| 31+     | HIGH   |

---

---

## 📈 Risk Levels For System

| Score   | Level  |
| ------- | ------ |
| 0 – 20  | LOW    |
| 21 – 40 | MEDIUM |
| 40+     | HIGH   |

---

---

## 📈 Risk Levels For Team

| Score   | Level  |
| ------- | ------ |
| 0 – 25  | LOW    |
| 26 – 50 | MEDIUM |
| 50+     | HIGH   |

---

## 🧱 Deletion Strategy

HDRT uses soft deletion to keep risk analytics accurate.

| Entity   | Strategy           |
| -------- | ------------------ |
| User     | status = DELETED   |
| Employee | isDeleted = true   |
| Manager  | isDeleted = true   |
| Task     | status = CANCELLED |
| Team     | status = DELETED   |
| System   | status = DELETED   |

---

## 🌱 Future Enhancements

- More real world complex logic
- Risk trend history
- System dependency graphs
- Notification & alerts
- Report export (CSV/PDF)

---

## ✅ Why HDRT

This project goes beyond CRUD by focusing on:

- Risk awareness
- Operational visibility
- Real-world enterprise logic
- Decision-support backend design

---

### ✅ HDRT: MVP Completed
