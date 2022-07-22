# p7backend - projet 7 - Groupomania - OC dev web

p7backend est l'API servant à gérer le traitement des données entre l'application front du projet 7 - Groupomania (p7frontend) et la base de données MySQL.

Pour utiliser cette API, les outils suivants doivent être installés :
- GIT, téléchargeable à cette adresse : https://git-scm.com/downloads
- node.js, téléchargeable à cette adresse : https://nodejs.org/en/download/

Ensuite, télécharger le fichier zip ou cloner le repository, utiliser une console de commande (comme GIT bash) pour aller dans le dossier créé (.../p7backend) et entrer 'npm install' pour installer tous les modules nécessaires.

Avant de lancer l'API, il convient de créer un sous-dossier 'images' à la racine, afin de stocker les éventuelles images ajoutées par les utilisateurs. De plus, un fichier .env, fourni par ailleurs, doit être copié à la racine.

Pour lancer l'API : avec la console de commande, dans le dossier créé précédemment, entrer 'node server'.

Note : le fichier .env contient notamment les paramètres de port de l'API et de l'application, ainsi que le mot de passe nécessaire à l'accès à la base de données MySQL. Cette base de données doit être reconstruite à l'aide des fichiers dump fournis en supplément.

Versions des logiciels utilisés :
- GIT : 2.34.1.windows.1
- node.js : v16.14.2
