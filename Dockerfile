# Instantiate Ubuntu 20.04
FROM ubuntu:20.04

# Update Ubuntu Software repository
RUN apt update

# Set timezone
ENV TZ=America/New_York
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install system requirements
RUN apt-get update && apt-get -y install curl
RUN curl -fsSL https://deb.nodesource.com/setup_20.x -o nodesource_setup.sh
RUN bash nodesource_setup.sh
RUN apt-get update && apt-get -y install nodejs

# Mount into app directory
RUN mkdir /app
COPY . /app
WORKDIR /app

# Install project dependencies
RUN npm i

# Open ports, start the application.
EXPOSE 8500
CMD exec npm start
# ----------------------------------------------------- 