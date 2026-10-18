#!/bin/bash
echo "======================================================================="
echo "  UASZ - L3 L2I : Développement d'Applications Orientées Services"
echo "  Binôme : Collé SYLL (202300489) & Ndeye Thiamba FAYE (202300488)"
echo "======================================================================="
cd ..
docker compose up --build -d
echo "Cluster démarré. Application disponible sur http://localhost:8080"
docker compose ps
