FROM cypress/browsers:node-22.13.1-chrome-132.0.6834.83-1

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

ENV CYPRESS_BASE_URL=http://localhost:5173

CMD ["npm", "run", "cy:run-audit"]