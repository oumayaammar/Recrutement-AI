from services.extraction_service import extraire_texte_fichier

chemin = "uploads/oumayaammar.pdf"

texte = extraire_texte_fichier(chemin)

print("===== TEXTE EXTRAIT =====")
print(texte)