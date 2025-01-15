#!/bin/bash

# Vérifie si un argument est passé
if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

VERSION=$1

# Fonction pour remplacer une ligne spécifique dans un fichier
replace_line() {
  local file=$1
  local line_number=$2
  local new_content=$3
  sed -i "${line_number}s/.*/${new_content}/" "$file"
}

# Fonction pour remplacer le contenu d'une ligne spécifiée dans un fichier JSON
replace_json_line() {
  local file=$1
  local line_number=$2
  local key=$3
  local new_value=$4
  sed -i "${line_number}s/\"${key}\": \".*\"/\"${key}\": \"${new_value}\"/" "$file"
}

# Modifier la ligne 1 du fichier .env.development en APP_VERSION=X
replace_line ".env.development" 2 "APP_VERSION=${VERSION}"

# Modifier la ligne 1 du fichier .env.test en APP_VERSION=X
replace_line ".env.production" 2 "APP_VERSION=${VERSION}"

# Modifier les lignes 3 et 9 du fichier package-lock.json en "version": "X"
replace_json_line "package-lock.json" 3 "version" "${VERSION}"
replace_json_line "package-lock.json" 9 "version" "${VERSION}"

# Modifier la ligne 4 du fichier package.json en "version": "X"
replace_json_line "package.json" 4 "version" "${VERSION}"

echo "Les fichiers ont été mis à jour avec la version ${VERSION}."
