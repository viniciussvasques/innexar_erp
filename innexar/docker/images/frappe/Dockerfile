FROM python:3.10-slim-bookworm

# Dependências do sistema
RUN apt-get update && apt-get install -y \
    build-essential mariadb-client \
    redis-tools curl git nodejs npm \
    fontconfig libfreetype6 libjpeg62-turbo libpng16-16 \
    libx11-6 libxext6 libxrender1 xfonts-75dpi xfonts-base \
    wkhtmltopdf \
    && rm -rf /var/lib/apt/lists/*

# Yarn
RUN npm install -g yarn

# Diretório de trabalho
WORKDIR /workspace

# Copiar source local
COPY ./frappe /workspace/frappe
COPY ./erpnext /workspace/erpnext

# Arquivo de apps para build de assets
RUN mkdir -p /workspace/sites/assets && printf "frappe\nerpnext\n" > /workspace/sites/apps.txt \
    && echo "{}" > /workspace/sites/assets/assets.json \
    && ln -s /workspace/sites /sites \
    && ln -s /workspace/sites/apps.txt /workspace/apps.txt \
    && ln -s /workspace/sites/assets /workspace/assets \
    && mkdir -p /workspace/logs \
    && ln -s /workspace/logs /logs

# Dependências Python
RUN pip install -U pip setuptools wheel
RUN pip install -e ./frappe
RUN pip install -e ./erpnext

# Bench CLI (necessário para comandos bench no entrypoint)
RUN pip install frappe-bench==5.20.0
RUN pip install "click<8"

# Build dos assets
RUN cd frappe && yarn install && yarn production
RUN cd erpnext && yarn install

# Copia entrypoint que garante build dos assets na primeira inicialização
COPY docker/images/frappe/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Define entrypoint genérico que verifica/gera assets e depois executa o comando original
ENTRYPOINT ["/entrypoint.sh"]

