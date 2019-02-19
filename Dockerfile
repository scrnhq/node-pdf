FROM node:10-slim

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && apt-key adv --keyserver keyserver.ubuntu.com --recv-keys E985B27B \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && sh -c 'echo "deb http://ppa.launchpad.net/no1wantdthisname/ppa/ubuntu/ trusty main" >> /etc/apt/sources.list.d/infiniality.list' \
    && apt-get update \
    && apt-get install -y libfontconfig fontconfig-infinality google-chrome-unstable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst ttf-freefont \
      --no-install-recommends \
    && /etc/fonts/infinality/infctl.sh setstyle osx \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /src/*.deb

COPY fonts /usr/local/share/fonts

COPY . /app
WORKDIR /app

# Install puppeteer so it's available in the container.
RUN npm install --quiet \
    && npm run build \
    # Add user so we don't need --no-sandbox.
    # same layer as npm install to keep re-chowned files from using up several hundred MBs more space
    && groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /app

# Run everything after as non-privileged user.
USER pptruser

EXPOSE 3000
CMD npm run serve
