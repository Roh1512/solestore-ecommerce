# SoleStore

SoleStore is an e-commerce application built using FastAPI for the backend and React for the frontend. This platform allows users to browse and purchase a wide variety of foot wears and shoes, while providing admins with robust tools to manage the platform.

---

## Features

### **User Features**

- Browse products by category, brand, and price.
- Add products to the cart and place orders.
- User authentication with registration and login.
- Profile management (update personal details and order history).

### **Admin Features**

- Add, edit, and delete products.
- View and manage user orders.
- Manage categories and inventory.
- View analytics and sales reports.

---

## Tech Stack

### **Backend**

- **Framework**: FastAPI
- **Database**: MongoDB
- **Authentication**: JSON Web Tokens (JWT)
- **Storage**: Cloudinary (for media uploads)
- **Testing**: Pytest

### **Frontend**

- **Library**: React (with TypeScript)
- **State Management**: Redux Toolkit
- **UI Framework**: React Bootstrap
- **Routing**: React Router v6

### **DevOps**

- **Server**: Render (backend hosting)

---

## Installation

### Prerequisites

- Python 3.9+
- Node.js 16+
- PostgreSQL / MongoDB database instance

### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/soleStore.git
   cd soleStore/server
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure the environment variables in .env
5. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```
6. Access the API documentation at http://localhost:8000/docs

### Frontend Setup

1. Navigate to the client directory:
   ```bash
   cd soleStore/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```
4. Access the app at 'http://localhost:5173'

## Testing

### Backend Tests

```bash
pytest app/tests
```

or

```bash
pytest
```

### Frontend Tests

```bash
npm run test
```

## Deployment

### Backend

1. Setup environment on render.
2. Install dependencies
3. Add environment variables

### Frontend Deployment

1. Build the front end application
   ```bash
   npm run build
   ```
2. Deliver the index.html file in "dist" folder from fastapi app

## Contact

For any questions or feedback, please reach out to:

- **Email**: rohithashok19@gmail.com
- **GitHub**: [yourusername](https://github.com/roh1512)
