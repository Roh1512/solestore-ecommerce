# Stage 1: Build the React client
FROM node:20 AS build-client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ .
RUN npm run build

FROM node:20 AS build-client-admin
WORKDIR /app/client_admin
COPY client_admin/package*.json ./
RUN npm install
COPY client_admin/ .
RUN npm run build

# Stage 2: Build the FastAPI app
FROM python:3.10-slim
WORKDIR /app

# Copy server requirements and install them
COPY server/requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt


# Copy server code
COPY server/ .

# Copy the React build from Stage 1 into the server's client/build folder
COPY --from=build-client client/build ./client/build
COPY --from=build-client-admin client_admin/build ./client_admin/build

# Expose the port FastAPI will run on
EXPOSE 8000

# Start the FastAPI server using uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
