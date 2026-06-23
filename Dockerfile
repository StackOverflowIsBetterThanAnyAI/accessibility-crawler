FROM cypress/browsers:node-24.15.0-chrome-147.0.7727.137-1-ff-150.0.1-edge-147.0.3912.86-1

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

COPY . .

ENTRYPOINT ["npm", "run"]

CMD ["cy:run-audit"]