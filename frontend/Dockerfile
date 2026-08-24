# Step 1: Use an official light Node.js environment as the foundation
FROM node:20-alpine

# Step 2: Set the internal folder where our code will live inside the container
WORKDIR /app

# Step 3: Copy tracking files first to utilize Docker's caching layer
COPY package*.json ./

# Step 4: Install all the web project dependencies
RUN npm install

# Step 5: Copy the rest of the application files into the container
COPY . .

# Step 6: Expose the port our Vite/React server uses (usually 5173)
EXPOSE 5173

# Step 7: The command to turn on our frontend web server when the container boots up
CMD ["npm", "run", "dev", "--", "--host"]
