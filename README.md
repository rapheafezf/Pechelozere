# Pêche en Lozère

Site vitrine sur la pêche en Lozère, le « Pays des Sources » : rivières de 1ère catégorie, truites sauvages, lacs préservés, réglementation, tarifs des cartes 2026 et réservation de guides.

Site statique (HTML / CSS / JavaScript vanilla), sans dépendance, prêt à héberger sur Netlify ou Vercel.

## Contenu

| Fichier | Rôle |
|---|---|
| `index.html` | Structure et contenu du site |
| `style.css` | Direction artistique « Granit & Fario » + sections sombres « Eau profonde » |
| `script.js` | Menu, animations au scroll, animations vectorielles, formulaires, saison en direct |
| `assets/images/` | Photos (non versionnées, voir plus bas) |
| `contenu-*.md`, `images-a-telecharger.md` | Notes de contenu et sources |

## Lancer en local

```bash
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Images

Les visuels utilisés en développement proviennent de [lozerepeche.com](https://www.lozerepeche.com) et **appartiennent à la Fédération de Pêche de la Lozère**. Ils ne sont pas inclus dans ce dépôt (voir `.gitignore`).

Pour afficher les images : place tes propres photos (ou des images libres de droits) dans `assets/images/` en respectant les noms de fichiers indiqués en commentaire dans `index.html`. Sans image, un fond de couleur « Photo à venir » s'affiche automatiquement.

## À compléter avant mise en ligne

- URL canonique dans `index.html`
- Liens des réseaux sociaux (footer)
- Mentions légales (boîte de dialogue)
- `fallbackEmail` dans `script.js`
- Les formulaires utilisent Netlify Forms : actifs une fois déployés sur Netlify.

## Crédits

- Données pêche : Fédération de la Lozère pour la Pêche et la Protection du Milieu Aquatique.
- Illustrations et animations vectorielles : création originale.
