FROM mhart/alpine-node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
ADD ./app/package.json .

# For npm@5 or later, copy package-lock.json as well
ADD ./app/package-lock.json .

RUN npm install --production

# Bundle app source
ADD ./app/. .

ENV NODE_ENV=production

EXPOSE 8080
CMD [ "npm", "start" ]
