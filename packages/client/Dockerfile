# Runtime variables
ARG NODE_VERSION=20
ARG NGINX_VERSION=1.27.3

################################################################################
# STAGE 1 : BASE
################################################################################

# Node image for base.
FROM node:${NODE_VERSION}-alpine as base

# Set working directory.
WORKDIR /app

################################################################################
# STAGE 2 : DEPENDENCIES
################################################################################

# Installing dependencies using base.
FROM base as packages

# Copy package files
COPY package*.json ./

# ?If Network error occure in npm install then use
# npm config set registry http://registry.npmjs.org/

# Using cache system benifit to speed-up subsequent build (better to skip for CI)
# RUN --mount=type=cache,target=/root/.npm \
#     npm ci

RUN npm ci

################################################################################
# STAGE 3 : BUILD
################################################################################

# Initiate build
FROM packages as build

# Copy the rest of the source files into the image.
COPY . .

# Run the build script.
RUN npm run build

################################################################################
# STAGE 4 : PRODUCTION
################################################################################

# Nginx base image for production to serve build files
FROM  nginx:${NGINX_VERSION}-alpine-slim as prod

# Copy output directories
COPY --from=build ./app/dist ./usr/share/nginx/html

# Copy nginx configurations
COPY nginx.conf /etc/nginx/conf.d

# Listening port
EXPOSE 3000

# Container command
CMD ["nginx", "-g", "daemon off;"]
