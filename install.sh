#!/usr/bin/env bash
# install.sh — Installateur d'autobash
# Usage : ./install.sh
#         curl -fsSL https://raw.githubusercontent.com/ErwannJardillet/AutoBash/main/install.sh | bash

set -euo pipefail

REPO_URL="https://github.com/ErwannJardillet/AutoBash"
INSTALL_DIR="$HOME/.local/share/autobash"
BIN_DIR="$HOME/.local/bin"
BIN_PATH="$BIN_DIR/autobash"

# ─── Couleurs ─────────────────────────────────────────────────────────────────
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; C='\033[0;36m'
BOLD='\033[1m'; NC='\033[0m'

ok()   { echo -e "  ${G}✔${NC}  $1"; }
warn() { echo -e "  ${Y}⚠${NC}  $1"; }
die()  { echo -e "  ${R}✖${NC}  $1" >&2; exit 1; }
info() { echo -e "  ${C}ℹ${NC}  $1"; }

echo ""
echo -e "${BOLD}${C}  autobash — Installation${NC}"
echo -e "  ─────────────────────────────────────"
echo ""

# ─── Prérequis ────────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  die "Node.js est requis (v18+). Installez-le depuis https://nodejs.org"
fi

NODE_MAJOR=$(node --version | sed 's/v\([0-9]*\).*/\1/')
if [[ "$NODE_MAJOR" -lt 18 ]]; then
  die "Node.js v18+ requis (version actuelle : $(node --version))"
fi
ok "Node.js $(node --version)"

if ! command -v npm &>/dev/null; then
  die "npm est requis."
fi
ok "npm $(npm --version)"

if ! command -v git &>/dev/null; then
  die "git est requis."
fi

# ─── Téléchargement ──────────────────────────────────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]:-$0}")" 2>/dev/null && pwd || pwd)"

if [[ -f "${SCRIPT_DIR}/package.json" ]]; then
  # Installation locale depuis le dépôt
  INSTALL_DIR="$SCRIPT_DIR"
  ok "Installation locale depuis ${SCRIPT_DIR}"
elif [[ -d "$INSTALL_DIR/.git" ]]; then
  info "Mise à jour du dépôt…"
  git -C "$INSTALL_DIR" pull --quiet
  ok "Dépôt mis à jour"
else
  info "Clonage du dépôt dans $INSTALL_DIR…"
  git clone --quiet "$REPO_URL" "$INSTALL_DIR"
  ok "Dépôt cloné"
fi

# ─── Build ────────────────────────────────────────────────────────────────────
info "Installation des dépendances npm…"
npm --prefix "$INSTALL_DIR" install --silent
ok "Dépendances installées"

info "Build de l'interface…"
npm --prefix "$INSTALL_DIR" run build --silent
ok "Build terminé"

# ─── Installation du binaire ──────────────────────────────────────────────────
mkdir -p "$BIN_DIR"
cat > "$BIN_PATH" << EOF
#!/usr/bin/env bash
exec node "${INSTALL_DIR}/dist/cli.js" "\$@"
EOF
chmod +x "$BIN_PATH"
ok "Binaire installé : $BIN_PATH"

# ─── PATH ─────────────────────────────────────────────────────────────────────
shell_rc=""
current_shell="${SHELL##*/}"
case "$current_shell" in
  zsh)  shell_rc="${ZDOTDIR:-$HOME}/.zshrc" ;;
  bash) shell_rc="$HOME/.bashrc" ;;
  fish) shell_rc="$HOME/.config/fish/config.fish" ;;
  *)    shell_rc="$HOME/.profile" ;;
esac

if ! echo "$PATH" | tr ':' '\n' | grep -qx "$BIN_DIR"; then
  warn "${BIN_DIR} n'est pas dans votre \$PATH."
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
