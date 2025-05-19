FROM node:18-alpine

# Update package index
RUN apk update

# Install Python and Java support
RUN apk add --no-cache \
    python3 \
    py3-pip \
    python3-dev \
    openjdk11 \
    openjdk11-jre \
    openjdk11-jdk \
    bash \
    curl \
    wget

# Install TypeScript support globally
RUN npm install -g typescript ts-node tsx @types/node

# Create working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install --production

# Create temp and execution directories
RUN mkdir -p /app/temp /app/execution
RUN chmod 777 /app/temp /app/execution

# Copy the execution server
COPY execution-server.js ./

# Create Python symlinks for compatibility
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Verify installations
RUN node --version
RUN python3 --version
RUN java -version
RUN javac -version
RUN npx tsc --version

# Set environment variables
ENV NODE_ENV=production
ENV JAVA_HOME=/usr/lib/jvm/java-11-openjdk
ENV PATH=$PATH:$JAVA_HOME/bin

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "execution-server.js"]
