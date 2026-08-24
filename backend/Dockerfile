# Step 1: Use the official lightweight Node environment
FROM node:20-alpine

# Step 2: Create the app directory inside the container
WORKDIR /usr/src/app

# Step 3: Copy package files first for fast caching
COPY package*.json ./

# Step 4: Install clean production dependencies
RUN npm ci --only=production

# Step 5: Copy the backend source files
COPY . .

# Step 6: Expose the API port (usually 3000 or 5000—change to match your app)
EXPOSE 5000

# Step 7: Boot up your backend API server
CMD ["npm", "start"]
