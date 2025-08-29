FROM  618305041992.dkr.ecr.ap-south-1.amazonaws.com/baseimages/arm/node:20-alpine3.19 as build

WORKDIR /opt/app

ARG ENV

COPY . .

RUN npm install

RUN if [ "$ENV" = "qa" ]; then npm run build:qa; else npm run build:prod; fi

FROM 618305041992.dkr.ecr.ap-south-1.amazonaws.com/baseimages/arm/nginx:1.27-alpine3.21-perl

COPY --from=build /opt/app/dist /var/www

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

ENTRYPOINT ["nginx","-g","daemon off;"]