# Stage 1: Build the React client
FROM node:20 AS client-builder

# Build main client
WORKDIR /app/client
COPY client/package*.json .
RUN npm install
COPY client .
RUN npm run build

# Build admin client
WORKDIR /app/client_admin
COPY client_admin/package*.json .
RUN npm install
COPY client_admin .
RUN npm run build

# Stage 2: Build the FastAPI app
FROM python:3.10-slim
WORKDIR /app

# Install server dependencies
COPY server/requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt


# Copy server code
COPY server/ .

# Copy built assets from client-builder
COPY --from=client-builder /app/client/dist ./client/dist
COPY --from=client-builder /app/client_admin/dist ./client_admin/dist

# Expose the port FastAPI will run on
EXPOSE 8000

# Start the FastAPI server using uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
