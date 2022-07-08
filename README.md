# p7backend - projet 7 - Groupomania - OC dev web

p7backend est l'API servant à gérer le traitement des données entre l'application front du projet 7 - Groupomania et la base de données MySQL

Pour installer cette API : télécharger le fichier zip ou cloner le repository, utiliser une console de commande pour aller dans le dossier créé (.../projet7/backend) et entrer 'npm install' pour installer tous les modules nécessaires.

Avant de lancer l'API, il convient de créer un dossier 'images' à la racine afin de stocker les éventuelles images ajoutées par les utilisateurs. De plus, un fichier env., fourni par ailleurs, doit être copié à la racine.

Pour lancer l'API : avec la console de commande, dans le dossier créé précédemment, entrer 'nodemon server'.

Note : le fichier .env contient notamment les paramètres de port de l'API et de l'application, ainsi que le mot de passe nécessaire à l'accès à la base de données locale. A modifier selon la situation. La base de données nécessaire à l'API doit être reconstruite à l'aide des fichiers dump fournis en supplément.