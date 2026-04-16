# autobash

Lanceur d'applications et de sites web entièrement configurable depuis le terminal.

Définissez des **profils** contenant des apps et des URLs, puis lancez-les en une seule commande.

![demo](https://raw.githubusercontent.com/ErwannJardillet/AutoBash/main/demo.gif)

## Installation rapide

```bash
curl -fsSL https://raw.githubusercontent.com/ErwannJardillet/AutoBash/main/install.sh | bash
```

Ou manuellement :

```bash
git clone https://github.com/ErwannJardillet/AutoBash.git
cd autobash
./install.sh
```

## Utilisation

```
autobash                  # Menu principal — choisir un profil
autobash <profil>         # Lancer directement un profil (nom ou slug)
autobash --new            # Créer un nouveau profil
autobash --profiles       # Gérer les profils (ajouter/modifier/supprimer)
autobash --settings       # Paramètres globaux (navigateur, délai, profil par défaut)
autobash --list           # Lister tous les profils
autobash --help           # Afficher l'aide
```

## Profils

Un **profil** est un groupe d'apps et d'URLs à lancer ensemble.

**Exemple — Profil "Travail" :**

```
autobash travail
```

Lance en arrière-plan :
- VS Code
- Terminal
- GitHub
- Notion
- Gmail

### Créer un profil

```bash
autobash --new
```

Le menu interactif guide pas à pas : nom du profil, ajout d'apps, ajout d'URLs.

### Format des fichiers de profil

Les profils sont stockés dans `~/.config/autobash/profiles/*.conf` :

```ini
NAME=Travail
DELAY=0.5

app|VS Code|code
app|Terminal|gnome-terminal
url|GitHub|https://github.com
url|Gmail|https://mail.google.com
url|Notion|https://notion.so
```

| Champ | Description |
|-------|-------------|
| `NAME` | Nom affiché dans les menus |
| `DELAY` | Délai (secondes) entre chaque lancement — optionnel, surcharge le global |
| `app\|Label\|commande` | Application à lancer via shell |
| `url\|Label\|https://...` | Site web à ouvrir dans le navigateur |

## Paramètres

```bash
autobash --settings
```

| Paramètre | Défaut | Description |
|-----------|--------|-------------|
| `BROWSER` | `xdg-open` | Navigateur utilisé pour les URLs |
| `DELAY` | `0.3` | Délai entre chaque lancement (secondes) |
| `DEFAULT_PROFILE` | _(vide)_ | Profil lancé automatiquement sans menu |

Les paramètres sont stockés dans `~/.config/autobash/settings.conf`.

## Configuration

```
~/.config/autobash/
├── settings.conf          # Paramètres globaux
└── profiles/
    ├── travail.conf        # Profil "Travail"
    ├── perso.conf          # Profil "Perso"
    └── dev.conf            # Profil "Dev"
```

## Désinstallation

```bash
rm ~/.local/bin/autobash
rm -rf ~/.config/autobash   # optionnel — supprime aussi la config
```

## Prérequis

- Bash 4.0+
- `xdg-open` (Linux) — fourni par `xdg-utils`, installé par défaut sur la plupart des distributions

## Licence

MIT
