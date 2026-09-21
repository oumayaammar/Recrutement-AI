from services.extraction_service import (
    extraire_texte_fichier,
    extraire_entites_llm,
)

chemin = "uploads/oumayaammar.pdf"

texte = extraire_texte_fichier(chemin)

print("===== TEXTE EXTRAIT =====")
print(texte)

print("\n===== ANALYSE QWEN =====")

resultat = extraire_entites_llm(texte)

print(resultat)