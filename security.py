import bcrypt

# NOTE: on utilise bcrypt directement (pas passlib) car passlib n'est plus
# maintenu et est incompatible avec les versions recentes de bcrypt (>=4.1),
# ce qui provoque une erreur "password cannot be longer than 72 bytes" meme
# sur des mots de passe courts.


def hash_password(mot_de_passe: str) -> str:
    hashed = bcrypt.hashpw(mot_de_passe.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(mot_de_passe_clair: str, mot_de_passe_hash: str) -> bool:
    return bcrypt.checkpw(
        mot_de_passe_clair.encode("utf-8"), mot_de_passe_hash.encode("utf-8")
    )
