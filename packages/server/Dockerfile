# Runtime variables.
ARG NODE_VERSION=20

################################################################################
# STAGE 1 : BASE
################################################################################

# Node image for base.
FROM node:${NODE_VERSION}-bookworm-slim as base 

################################################################################
# STAGE 2 : DEPENDENCIES 
################################################################################

# Installing dependencies using base
FROM base as deps

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# ?If Network error occure in npm install then use
# npm config set registry http://registry.npmjs.org/

# Using cache to speed-up subsequent builds (better to skip for CI)
# RUN --mount=type=cache,target=/root/.npm \
#     npm ci --omit=dev

RUN npm ci --omit=dev

################################################################################
# STAGE 3 : BUILD
################################################################################

# Initiate build
FROM deps as build

# Copy the rest of the source files into the image.
COPY . .

# Install ncc package
RUN npm i -g @vercel/ncc

# Create build in dist directory
RUN ncc build index.js -o dist

################################################################################
# STAGE 4 : PRODUCTION
################################################################################

# Distroless image for production
FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian12 as prod

# Set working directory
WORKDIR /app

# Copy require files from previous stage
COPY --from=build /app/dist/ .
# COPY --from=build /app/node_modules ./node_modules 

# Container command
CMD ["index.js"]
