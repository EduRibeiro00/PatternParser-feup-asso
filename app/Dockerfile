FROM node:10.13.0

# create directory
WORKDIR /usr/src/app

# copy package JSONs
COPY package*.json ./
COPY tsconfig.json ./

# install all packages
RUN npm install
RUN npm update

# copy all other source code to work directory
COPY . .
