FROM node:lts

RUN npm install -g markdown-toc

ENTRYPOINT ["/usr/local/bin/markdown-toc"]
