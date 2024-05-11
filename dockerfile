FROM node:lts-alpine
WORKDIR /home/node/app
ENV NODE_ENV production
COPY . .
EXPOSE 80
CMD ["node", "."]