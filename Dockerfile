FROM node:18-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm install --production
COPY . .
ENV TZ=Asia/Jerusalem
EXPOSE 3000
CMD ["npm", "start"]
