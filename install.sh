#!/usr/bin/env bash
# install.sh — Installateur d'autobash
# Usage : ./install.sh
#         curl -fsSL https://raw.githubusercontent.com/ErwannJardillet/AutoBash/main/install.sh | bash

set -euo pipefail

REPO="https://raw.githubusercontent.com/ErwannJardillet/AutoBash/main"
INSTALL_DIR="${HOME}/.local/bin"
SCRIPT_NAME="autobash"

# ─── Couleurs ─────────────────────────────────────────────────────────────────
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; C='\033[0;36m'
BOLD='\033[1m'; NC='\033[0m'

ok()   { echo -e "  ${G}✔${NC}  $1"; }
warn() { echo -e "  ${Y}⚠${NC}  $1"; }
err()  { echo -e "  ${R}✖${NC}  $1"; exit 1; }
info() { echo -e "  ${C}ℹ${NC}  $1"; }

echo ""
echo -e "${BOLD}${C}  autobash — Installation${NC}"
echo -e "  ─────────────────────────────────────"
echo ""

# ─── Vérifier bash ────────────────────────────────────────────────────────────
bash_version=$(bash --version | head -1 | grep -oP '\d+\.\d+' | head -1 || true)
bash_major=${bash_version%%.*}
if [[ -z "$bash_major" || "$bash_major" -lt 4 ]]; then
  err "Bash 4.0+ requis (version actuelle : ${bash_version:-inconnue})"
fi
ok "Bash ${bash_version}"

# ─── Créer le répertoire d'installation ───────────────────────────────────────
mkdir -p "$INSTALL_DIR"
ok "Répertoire d'installation : ${INSTALL_DIR}"

# ─── Télécharger ou copier le script ──────────────────────────────────────────
TARGET="${INSTALL_DIR}/${SCRIPT_NAME}"

# Si on est dans le répertoire du repo (installation locale)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || pwd)"
if [[ -f "${SCRIPT_DIR}/autobash" ]]; then
  cp "${SCRIPT_DIR}/autobash" "$TARGET"
  ok "Script copié depuis ${SCRIPT_DIR}"
else
  # Téléchargement depuis GitHub
  info "Téléchargement depuis GitHub..."
  if command -v curl &>/dev/null; then
    curl -fsSL "${REPO}/autobash" -o "$TARGET"
  elif command -v wget &>/dev/null; then
    wget -qO "$TARGET" "${REPO}/autobash"
  else
    err "curl ou wget est requis pour l'installation."
  fi
  ok "Script téléchargé depuis GitHub"
fi

chmod +x "$TARGET"
ok "Permissions configurées"

# ─── Vérifier que ~/.local/bin est dans le PATH ───────────────────────────────
shell_rc=""
current_shell="${SHELL##*/}"
case "$current_shell" in
  zsh)  shell_rc="${ZDOTDIR:-$HOME}/.zshrc" ;;
  bash) shell_rc="$HOME/.bashrc" ;;
  fish) shell_rc="$HOME/.config/fish/config.fish" ;;
  *)    shell_rc="$HOME/.profile" ;;
esac

if ! echo "$PATH" | grep -q "${INSTALL_DIR}"; then
  warn "${INSTALL_DIR} n'est pas dans votre \$PATH."
  echo ""
  echo -e "  Ajoutez cette ligne à ${shell_rc} :"
  echo -e "  ${BOLD}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}"
  echo ""
  echo -e "  Puis rechargez : ${BOLD}source ${shell_rc}${NC}"
  echo ""
else
  ok "\$PATH configuré correctement"
fi

# ─── Terminé ──────────────────────────────────────────────────────────────────
echo ""
echo -e "  ${BOLD}${G}Installation terminée !${NC}"
echo ""
echo -e "  Lancez ${BOLD}autobash${NC} pour démarrer."
echo ""
