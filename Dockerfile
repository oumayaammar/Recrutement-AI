FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# IMPORTANT: installe torch en version CPU-only AVANT le reste.
# Sans ca, sentence-transformers tire la version GPU de torch par defaut,
# ce qui telecharge plusieurs Go de librairies CUDA/NVIDIA totalement
# inutiles ici (pas de GPU dans ce conteneur).
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

RUN pip install --no-cache-dir -r requirements.txt

# Precharge le modele d'embeddings au build (evite un telechargement lent
# et une dependance reseau au premier appel /embedding en production).
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')"

COPY . .

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/docker-entrypoint.sh"]