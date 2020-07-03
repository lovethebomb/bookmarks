FROM node:lts-alpine

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV BOOKMARKS_BEARER_TOKEN=a-super-secret-key

# Create app directory
RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json index.js bookmark.js /app/
RUN npm ci 

VOLUME ["/app/data"]
CMD [ "npm", "start" ]