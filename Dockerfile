# Use Apify's official Node.js image with Playwright pre-installed
FROM apify/actor-node-playwright-chrome:18

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the actor's code
COPY . ./

# Run the actor
CMD npm start
