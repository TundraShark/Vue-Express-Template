FROM node:carbon
WORKDIR /usr/src/app
COPY package.json .
RUN npm install
COPY . .
ARG MODE
ENV mode=$MODE
RUN if [ "$MODE" = "dev" ] || [ "$MODE" = "prod" ]; then :; else echo "The environment variable \"MODE\" must be either \"local\", \"dev\", or \"prod\""; exit 128; fi
CMD npm run api_dev
# RUN if [ "$MODE" = "dev"  ]; then : CMD npm run api_dev ; fi :;
# RUN if [ "$MODE" = "prod" ]; then : CMD npm run api_prod; fi :;
EXPOSE 80
