#!/usr/bin/env node

// src/cli.tsx
import { render } from "ink";

// src/App.tsx
import { useState as useState7 } from "react";
import { Box as Box10 } from "ink";

// src/screens/MainMenu.tsx
import { Box as Box3, Text as Text3, useApp } from "ink";

// src/components/Header.tsx
import { Box, Text } from "ink";

// src/lib/config.ts
import fs from "fs";
import path from "path";
import os from "os";
var CONFIG_DIR = process.env["XDG_CONFIG_HOME"] ? path.join(process.env["XDG_CONFIG_HOME"], "autobash") : path.join(os.homedir(), ".config", "autobash");
var PROFILES_DIR = path.join(CONFIG_DIR, "profiles");
var SETTINGS_FILE = path.join(CONFIG_DIR, "settings.conf");
var VERSION = "1.0.2";
function initConfig() {
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(
      SETTINGS_FILE,
      "# autobash \u2014 Param\xE8tres globaux\nBROWSER=xdg-open\nDELAY=0.3\nDEFAULT_PROFILE=\n"
    );
  }
}
function loadSettings() {
  const s = { browser: "xdg-open", delay: "0.3", defaultProfile: "" };
  if (!fs.existsSync(SETTINGS_FILE)) return s;
  for (const line of fs.readFileSync(SETTINGS_FILE, "utf8").split("\n")) {
    if (line.startsWith("#") || !line.includes("=")) continue;
    const eq = line.indexOf("=");
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (key === "BROWSER") s.browser = val;
    else if (key === "DELAY") s.delay = val;
    else if (key === "DEFAULT_PROFILE") s.defaultProfile = val;
  }
  return s;
}
function saveSetting(key, val) {
  if (!fs.existsSync(SETTINGS_FILE)) initConfig();
  let content = fs.readFileSync(SETTINGS_FILE, "utf8");
  const re = new RegExp(`^${key}=.*$`, "m");
  content = re.test(content) ? content.replace(re, `${key}=${val}`) : content + `
${key}=${val}`;
  fs.writeFileSync(SETTINGS_FILE, content);
}
function listProfiles() {
  if (!fs.existsSync(PROFILES_DIR)) return [];
  return fs.readdirSync(PROFILES_DIR).filter((f) => f.endsWith(".conf")).map((f) => f.slice(0, -5));
}
function profileExists(slug) {
  return fs.existsSync(path.join(PROFILES_DIR, `${slug}.conf`));
}
function readProfile(slug) {
  const file = path.join(PROFILES_DIR, `${slug}.conf`);
  if (!fs.existsSync(file)) return null;
  const p = { slug, name: slug, items: [] };
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    if (!line || line.startsWith("#")) continue;
    if (line.startsWith("NAME=")) {
      p.name = line.slice(5);
      continue;
    }
    if (line.startsWith("DELAY=")) {
      p.delay = line.slice(6);
      continue;
    }
    const parts = line.split("|");
    if (parts.length === 3 && (parts[0] === "app" || parts[0] === "url")) {
      p.items.push({ type: parts[0], label: parts[1], cmd: parts[2] });
    }
  }
  return p;
}
function saveProfile(profile) {
  const file = path.join(PROFILES_DIR, `${profile.slug}.conf`);
  let content = `# Profil autobash : ${profile.name}
NAME=${profile.name}
`;
  if (profile.delay) content += `DELAY=${profile.delay}
`;
  for (const item of profile.items) content += `${item.type}|${item.label}|${item.cmd}
`;
  fs.writeFileSync(file, content);
}
function createProfile(name) {
  let slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  let n = 1;
  const base = slug;
  while (profileExists(slug)) slug = `${base}-${n++}`;
  fs.writeFileSync(
    path.join(PROFILES_DIR, `${slug}.conf`),
    `# Profil autobash : ${name}
NAME=${name}
`
  );
  return slug;
}
function deleteProfile(slug) {
  const file = path.join(PROFILES_DIR, `${slug}.conf`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}
function findProfileByName(query) {
  const q = query.toLowerCase();
  for (const slug of listProfiles()) {
    const p = readProfile(slug);
    if (p && p.name.toLowerCase() === q) return slug;
  }
  return null;
}

// src/components/Header.tsx
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
function Header({ subtitle }) {
  return /* @__PURE__ */ jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [
    /* @__PURE__ */ jsxs(Box, { paddingX: 2, gap: 1, children: [
      /* @__PURE__ */ jsx(Text, { bold: true, color: "cyan", children: "\u26A1 autobash" }),
      /* @__PURE__ */ jsxs(Text, { dimColor: true, children: [
        "v",
        VERSION
      ] }),
      subtitle && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Text, { dimColor: true, children: "\u203A" }),
        /* @__PURE__ */ jsx(Text, { bold: true, color: "white", children: subtitle })
      ] })
    ] }),
    /* @__PURE__ */ jsx(Box, { paddingX: 2, children: /* @__PURE__ */ jsx(Text, { color: "cyan", children: "\u2500".repeat(48) }) })
  ] });
}

// src/components/SelectList.tsx
import { useState, useEffect } from "react";
import { Box as Box2, Text as Text2, useInput } from "ink";
import { jsx as jsx2, jsxs as jsxs2 } from "react/jsx-runtime";
function SelectList({
  items,
  onSelect,
  onCancel,
  initialIndex = 0,
  hint
}) {
  const selectable = items.filter((i) => !i.separator);
  const [selIdx, setSelIdx] = useState(() => Math.max(0, initialIndex));
  useEffect(() => {
    setSelIdx(0);
  }, [items.length]);
  const selectedItem = selectable[selIdx];
  useInput((_, key) => {
    if (key.upArrow) {
      setSelIdx((i) => Math.max(0, i - 1));
    } else if (key.downArrow) {
      setSelIdx((i) => Math.min(selectable.length - 1, i + 1));
    } else if (key.return && selectedItem) {
      onSelect(selectedItem);
    } else if (key.escape && onCancel) {
      onCancel();
    }
  });
  return /* @__PURE__ */ jsxs2(Box2, { flexDirection: "column", children: [
    items.map((item, i) => {
      if (item.separator) {
        return /* @__PURE__ */ jsx2(Box2, { paddingX: 2, marginY: 0, children: /* @__PURE__ */ jsx2(Text2, { dimColor: true, children: "\u2500".repeat(38) }) }, i);
      }
      const isSelected = selectable[selIdx] === item;
      return /* @__PURE__ */ jsxs2(Box2, { paddingX: 2, children: [
        /* @__PURE__ */ jsx2(Text2, { color: "cyan", children: isSelected ? "\u276F " : "  " }),
        /* @__PURE__ */ jsx2(
          Text2,
          {
            bold: isSelected && !item.dim,
            color: item.dim ? void 0 : isSelected ? "cyan" : void 0,
            dimColor: !isSelected || item.dim,
            children: item.label
          }
        ),
        item.hint && /* @__PURE__ */ jsxs2(Text2, { dimColor: true, children: [
          "   ",
          item.hint
        ] })
      ] }, i);
    }),
    hint && /* @__PURE__ */ jsx2(Box2, { marginTop: 1, paddingX: 2, children: /* @__PURE__ */ jsx2(Text2, { dimColor: true, children: hint }) })
  ] });
}

// src/screens/MainMenu.tsx
import { jsx as jsx3, jsxs as jsxs3 } from "react/jsx-runtime";
var ITEMS = [
  { label: "Profils", value: "profiles", hint: "cr\xE9er, modifier, lancer" },
  { label: "Param\xE8tres", value: "settings", hint: "navigateur, d\xE9lai, d\xE9faut" },
  { label: "Aide", value: "help", hint: "commandes et options" },
  { separator: true, label: "", value: "sep" },
  { label: "Quitter", value: "quit", dim: true }
];
function MainMenu({ onNavigate }) {
  const { exit } = useApp();
  return /* @__PURE__ */ jsxs3(Box3, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx3(Header, {}),
    /* @__PURE__ */ jsxs3(Box3, { flexDirection: "column", paddingX: 2, children: [
      /* @__PURE__ */ jsx3(Box3, { marginBottom: 1, children: /* @__PURE__ */ jsx3(Text3, { dimColor: true, children: "Lancez vos apps et sites en un instant." }) }),
      /* @__PURE__ */ jsx3(
        SelectList,
        {
          items: ITEMS,
          onSelect: (item) => {
            if (item.value === "quit") exit();
            else if (item.value !== "sep") onNavigate({ type: item.value });
          },
          onCancel: () => exit(),
          hint: "\u2191\u2193 naviguer  \xB7  \u21B5 s\xE9lectionner  \xB7  Esc quitter"
        }
      )
    ] })
  ] });
}

// src/screens/SettingsScreen.tsx
import { useState as useState2, useEffect as useEffect2 } from "react";
import { Box as Box4, Text as Text4, useInput as useInput2 } from "ink";
import TextInput from "ink-text-input";
import { jsx as jsx4, jsxs as jsxs4 } from "react/jsx-runtime";
function InputField({
  label,
  placeholder,
  value,
  onChange,
  onSubmit,
  onCancel,
  hint
}) {
  useInput2((_, key) => {
    if (key.escape) onCancel();
  });
  return /* @__PURE__ */ jsxs4(Box4, { flexDirection: "column", paddingX: 2, gap: 1, children: [
    /* @__PURE__ */ jsx4(Text4, { bold: true, children: label }),
    hint && /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: hint }),
    /* @__PURE__ */ jsxs4(Box4, { gap: 1, children: [
      /* @__PURE__ */ jsx4(Text4, { color: "cyan", children: "\u203A" }),
      /* @__PURE__ */ jsx4(TextInput, { value, onChange, placeholder, onSubmit })
    ] }),
    /* @__PURE__ */ jsx4(Text4, { dimColor: true, children: "\u21B5 confirmer  \xB7  Esc annuler" })
  ] });
}
function SettingsScreen({ onBack }) {
  const [settings2, setSettings] = useState2(() => loadSettings());
  const [mode, setMode] = useState2("menu");
  const [input, setInput] = useState2("");
  const [feedback, setFeedback] = useState2(null);
  const [profiles] = useState2(() => listProfiles().map((s) => ({ slug: s, name: readProfile(s)?.name ?? s })));
  useEffect2(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 1500);
      return () => clearTimeout(t);
    }
  }, [feedback]);
  const reload = () => setSettings(loadSettings());
  const menuItems = [
    { label: "Navigateur", value: "browser", hint: settings2.browser },
    { label: "D\xE9lai global", value: "delay", hint: `${settings2.delay}s` },
    { label: "Profil par d\xE9faut", value: "default", hint: settings2.defaultProfile || "aucun" },
    { separator: true, label: "", value: "" },
    { label: "Retour", value: "back", dim: true }
  ];
  if (mode === "editBrowser") {
    return /* @__PURE__ */ jsxs4(Box4, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx4(Header, { subtitle: "Param\xE8tres \u203A Navigateur" }),
      /* @__PURE__ */ jsx4(
        InputField,
        {
          label: "Navigateur par d\xE9faut",
          placeholder: "ex: firefox, chromium, xdg-open",
          value: input,
          onChange: setInput,
          onSubmit: (val) => {
            if (val.trim()) {
              saveSetting("BROWSER", val.trim());
              setFeedback({ msg: "Navigateur mis \xE0 jour", ok: true });
              reload();
            }
            setMode("menu");
          },
          onCancel: () => setMode("menu")
        }
      )
    ] });
  }
  if (mode === "editDelay") {
    return /* @__PURE__ */ jsxs4(Box4, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx4(Header, { subtitle: "Param\xE8tres \u203A D\xE9lai" }),
      /* @__PURE__ */ jsx4(
        InputField,
        {
          label: "D\xE9lai entre chaque lancement (secondes)",
          placeholder: "ex: 0.3, 1, 0",
          value: input,
          onChange: setInput,
          onSubmit: (val) => {
            if (/^\d+(\.\d+)?$/.test(val.trim())) {
              saveSetting("DELAY", val.trim());
              setFeedback({ msg: "D\xE9lai mis \xE0 jour", ok: true });
              reload();
            } else {
              setFeedback({ msg: "Valeur invalide (nombre attendu)", ok: false });
            }
            setMode("menu");
          },
          onCancel: () => setMode("menu")
        }
      )
    ] });
  }
  if (mode === "editDefault") {
    const defItems = [
      { label: "Aucun (afficher le menu)", value: "" },
      ...profiles.map((p) => ({ label: p.name, value: p.slug, hint: p.slug }))
    ];
    return /* @__PURE__ */ jsxs4(Box4, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx4(Header, { subtitle: "Param\xE8tres \u203A Profil par d\xE9faut" }),
      /* @__PURE__ */ jsx4(Box4, { paddingX: 2, children: /* @__PURE__ */ jsx4(
        SelectList,
        {
          items: defItems,
          onSelect: (item) => {
            saveSetting("DEFAULT_PROFILE", item.value);
            setFeedback({ msg: "Profil par d\xE9faut mis \xE0 jour", ok: true });
            reload();
            setMode("menu");
          },
          onCancel: () => setMode("menu"),
          hint: "\u2191\u2193 naviguer  \xB7  \u21B5 choisir  \xB7  Esc annuler"
        }
      ) })
    ] });
  }
  return /* @__PURE__ */ jsxs4(Box4, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx4(Header, { subtitle: "Param\xE8tres" }),
    /* @__PURE__ */ jsxs4(Box4, { flexDirection: "column", paddingX: 2, children: [
      feedback && /* @__PURE__ */ jsx4(Box4, { marginBottom: 1, children: /* @__PURE__ */ jsxs4(Text4, { color: feedback.ok ? "green" : "red", children: [
        feedback.ok ? "\u2714" : "\u2716",
        "  ",
        feedback.msg
      ] }) }),
      /* @__PURE__ */ jsx4(
        SelectList,
        {
          items: menuItems,
          onSelect: (item) => {
            if (item.value === "back") {
              onBack();
              return;
            }
            setInput("");
            if (item.value === "browser") setMode("editBrowser");
            else if (item.value === "delay") setMode("editDelay");
            else if (item.value === "default") setMode("editDefault");
          },
          onCancel: onBack,
          hint: "\u2191\u2193 naviguer  \xB7  \u21B5 modifier  \xB7  Esc retour"
        }
      )
    ] })
  ] });
}

// src/screens/ProfilesScreen.tsx
import { useState as useState3, useCallback } from "react";
import { Box as Box5, Text as Text5, useInput as useInput3 } from "ink";
import { jsx as jsx5, jsxs as jsxs5 } from "react/jsx-runtime";
function buildItems() {
  const slugs = listProfiles();
  const items = slugs.map((slug) => {
    const p = readProfile(slug);
    const count = p?.items.length ?? 0;
    return {
      label: p?.name ?? slug,
      value: `edit:${slug}`,
      hint: `${count} \xE9l\xE9ment${count !== 1 ? "s" : ""}`
    };
  });
  if (items.length > 0) items.push({ separator: true, label: "", value: "" });
  items.push({ label: "Nouveau profil", value: "new" });
  items.push({ separator: true, label: "", value: "" });
  items.push({ label: "Retour", value: "back", dim: true });
  return items;
}
function ProfilesScreen({ onNavigate, onBack }) {
  const [items, setItems] = useState3(() => buildItems());
  const refresh = useCallback(() => setItems(buildItems()), []);
  void refresh;
  useInput3((_, key) => {
    if (key.escape) onBack();
  });
  return /* @__PURE__ */ jsxs5(Box5, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx5(Header, { subtitle: "Profils" }),
    /* @__PURE__ */ jsxs5(Box5, { flexDirection: "column", paddingX: 2, children: [
      listProfiles().length === 0 && /* @__PURE__ */ jsx5(Box5, { marginBottom: 1, children: /* @__PURE__ */ jsx5(Text5, { dimColor: true, children: "Aucun profil \u2014 cr\xE9ez-en un ci-dessous." }) }),
      /* @__PURE__ */ jsx5(
        SelectList,
        {
          items,
          onSelect: (item) => {
            if (item.value === "back") {
              onBack();
              return;
            }
            if (item.value === "new") {
              onNavigate({ type: "createProfile" });
              return;
            }
            if (item.value.startsWith("edit:")) {
              onNavigate({ type: "editProfile", slug: item.value.slice(5) });
            }
          },
          onCancel: onBack,
          hint: "\u2191\u2193 naviguer  \xB7  \u21B5 ouvrir  \xB7  Esc retour"
        }
      )
    ] })
  ] });
}

// src/screens/EditProfileScreen.tsx
import { useState as useState4, useEffect as useEffect3 } from "react";
import { Box as Box6, Text as Text6, useInput as useInput4 } from "ink";
import TextInput2 from "ink-text-input";
import { jsx as jsx6, jsxs as jsxs6 } from "react/jsx-runtime";
function InputScreen({ title, label, placeholder, value, onChange, onSubmit, onCancel, hint }) {
  useInput4((_, key) => {
    if (key.escape) onCancel();
  });
  return /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx6(Header, { subtitle: title }),
    /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", paddingX: 2, gap: 1, children: [
      /* @__PURE__ */ jsx6(Text6, { bold: true, children: label }),
      hint && /* @__PURE__ */ jsx6(Text6, { dimColor: true, children: hint }),
      /* @__PURE__ */ jsxs6(Box6, { gap: 1, children: [
        /* @__PURE__ */ jsx6(Text6, { color: "cyan", children: "\u203A" }),
        /* @__PURE__ */ jsx6(TextInput2, { value, onChange, placeholder, onSubmit })
      ] }),
      /* @__PURE__ */ jsx6(Text6, { dimColor: true, children: "\u21B5 confirmer  \xB7  Esc annuler" })
    ] })
  ] });
}
function EditProfileScreen({ slug, onBack, onNavigate }) {
  const [profile, setProfile] = useState4(() => readProfile(slug));
  const [mode, setMode] = useState4("menu");
  const [input, setInput] = useState4("");
  const [pendingLabel, setPendingLabel] = useState4("");
  const [feedback, setFeedback] = useState4(null);
  useEffect3(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 1500);
      return () => clearTimeout(t);
    }
  }, [feedback]);
  const persist = (p) => {
    saveProfile(p);
    setProfile(p);
  };
  if (!profile) {
    return /* @__PURE__ */ jsx6(Box6, { paddingX: 2, children: /* @__PURE__ */ jsx6(Text6, { color: "red", children: "\u2716  Profil introuvable." }) });
  }
  if (mode === "rename") {
    return /* @__PURE__ */ jsx6(
      InputScreen,
      {
        title: `${profile.name} \u203A Renommer`,
        label: "Nouveau nom",
        placeholder: profile.name,
        value: input,
        onChange: setInput,
        onSubmit: (val) => {
          if (val.trim()) {
            persist({ ...profile, name: val.trim() });
            setFeedback({ msg: `Renomm\xE9 en "${val.trim()}"`, ok: true });
          }
          setMode("menu");
          setInput("");
        },
        onCancel: () => {
          setMode("menu");
          setInput("");
        }
      }
    );
  }
  if (mode === "delay") {
    return /* @__PURE__ */ jsx6(
      InputScreen,
      {
        title: `${profile.name} \u203A D\xE9lai`,
        label: "D\xE9lai entre chaque lancement (secondes)",
        placeholder: profile.delay ?? "global",
        value: input,
        onChange: setInput,
        hint: "Laisser vide pour utiliser le d\xE9lai global",
        onSubmit: (val) => {
          if (val === "") {
            persist({ ...profile, delay: void 0 });
            setFeedback({ msg: "D\xE9lai global utilis\xE9", ok: true });
          } else if (/^\d+(\.\d+)?$/.test(val)) {
            persist({ ...profile, delay: val });
            setFeedback({ msg: `D\xE9lai : ${val}s`, ok: true });
          } else {
            setFeedback({ msg: "Valeur invalide", ok: false });
          }
          setMode("menu");
          setInput("");
        },
        onCancel: () => {
          setMode("menu");
          setInput("");
        }
      }
    );
  }
  if (mode === "addUrlLabel") {
    return /* @__PURE__ */ jsx6(
      InputScreen,
      {
        title: `${profile.name} \u203A Ajouter un site`,
        label: "Nom affich\xE9",
        placeholder: "ex: GitHub, Gmail\u2026",
        value: input,
        onChange: setInput,
        onSubmit: (val) => {
          if (!val.trim()) {
            setMode("menu");
            return;
          }
          setPendingLabel(val.trim());
          setInput("");
          setMode("addUrlCmd");
        },
        onCancel: () => {
          setMode("menu");
          setInput("");
        }
      }
    );
  }
  if (mode === "addUrlCmd") {
    return /* @__PURE__ */ jsx6(
      InputScreen,
      {
        title: `${profile.name} \u203A Ajouter un site`,
        label: `URL pour "${pendingLabel}"`,
        placeholder: "https://\u2026",
        value: input,
        onChange: setInput,
        onSubmit: (val) => {
          if (val.trim()) {
            persist({ ...profile, items: [...profile.items, { type: "url", label: pendingLabel, cmd: val.trim() }] });
            setFeedback({ msg: `"${pendingLabel}" ajout\xE9`, ok: true });
          }
          setMode("menu");
          setInput("");
        },
        onCancel: () => {
          setMode("menu");
          setInput("");
        }
      }
    );
  }
  if (mode === "addAppLabel") {
    return /* @__PURE__ */ jsx6(
      InputScreen,
      {
        title: `${profile.name} \u203A Ajouter une appli`,
        label: "Nom affich\xE9",
        placeholder: "ex: VS Code, Spotify\u2026",
        value: input,
        onChange: setInput,
        onSubmit: (val) => {
          if (!val.trim()) {
            setMode("menu");
            return;
          }
          setPendingLabel(val.trim());
          setInput("");
          setMode("addAppCmd");
        },
        onCancel: () => {
          setMode("menu");
          setInput("");
        }
      }
    );
  }
  if (mode === "addAppCmd") {
    return /* @__PURE__ */ jsx6(
      InputScreen,
      {
        title: `${profile.name} \u203A Ajouter une appli`,
        label: `Commande shell pour "${pendingLabel}"`,
        placeholder: "ex: code, spotify, discord",
        value: input,
        onChange: setInput,
        onSubmit: (val) => {
          if (val.trim()) {
            persist({ ...profile, items: [...profile.items, { type: "app", label: pendingLabel, cmd: val.trim() }] });
            setFeedback({ msg: `"${pendingLabel}" ajout\xE9`, ok: true });
          }
          setMode("menu");
          setInput("");
        },
        onCancel: () => {
          setMode("menu");
          setInput("");
        }
      }
    );
  }
  if (mode === "confirmDelete") {
    const items = [
      { label: "Annuler", value: "no" },
      { label: `Supprimer "${profile.name}"`, value: "yes", dim: true }
    ];
    return /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx6(Header, { subtitle: `${profile.name} \u203A Supprimer` }),
      /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", paddingX: 2, children: [
        /* @__PURE__ */ jsx6(Box6, { marginBottom: 1, children: /* @__PURE__ */ jsx6(Text6, { color: "red", children: "Cette action est irr\xE9versible." }) }),
        /* @__PURE__ */ jsx6(
          SelectList,
          {
            items,
            onSelect: (item) => {
              if (item.value === "yes") {
                deleteProfile(slug);
                onBack();
              } else setMode("menu");
            },
            onCancel: () => setMode("menu")
          }
        )
      ] })
    ] });
  }
  const menuItems = [
    ...profile.items.map((item, i) => ({
      label: item.label,
      value: `del:${i}`,
      hint: `${item.type === "url" ? "url" : "app"}  ${item.cmd}`
    }))
  ];
  if (profile.items.length > 0) menuItems.push({ separator: true, label: "", value: "" });
  menuItems.push(
    { label: "Ajouter un site web", value: "addUrl" },
    { label: "Ajouter une application", value: "addApp" },
    { separator: true, label: "", value: "" },
    { label: "Lancer ce profil", value: "launch" },
    { label: "Renommer", value: "rename" },
    { label: "Changer le d\xE9lai", value: "delay", hint: profile.delay ? `${profile.delay}s` : "global" },
    { separator: true, label: "", value: "" },
    { label: "Supprimer ce profil", value: "delete", dim: true },
    { label: "Retour", value: "back", dim: true }
  );
  return /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx6(Header, { subtitle: profile.name }),
    /* @__PURE__ */ jsxs6(Box6, { flexDirection: "column", paddingX: 2, children: [
      profile.items.length === 0 ? /* @__PURE__ */ jsx6(Box6, { marginBottom: 1, children: /* @__PURE__ */ jsx6(Text6, { dimColor: true, children: "Aucun \xE9l\xE9ment \u2014 ajoutez un site ou une application." }) }) : /* @__PURE__ */ jsx6(Box6, { marginBottom: 1, children: /* @__PURE__ */ jsxs6(Text6, { dimColor: true, children: [
        profile.items.length,
        " \xE9l\xE9ment",
        profile.items.length !== 1 ? "s" : "",
        "  \xB7  s\xE9lectionner pour supprimer"
      ] }) }),
      feedback && /* @__PURE__ */ jsx6(Box6, { marginBottom: 1, children: /* @__PURE__ */ jsxs6(Text6, { color: feedback.ok ? "green" : "red", children: [
        feedback.ok ? "\u2714" : "\u2716",
        "  ",
        feedback.msg
      ] }) }),
      /* @__PURE__ */ jsx6(
        SelectList,
        {
          items: menuItems,
          onSelect: (item) => {
            if (item.value === "back") {
              onBack();
              return;
            }
            if (item.value === "addUrl") {
              setInput("");
              setMode("addUrlLabel");
              return;
            }
            if (item.value === "addApp") {
              setInput("");
              setMode("addAppLabel");
              return;
            }
            if (item.value === "rename") {
              setInput("");
              setMode("rename");
              return;
            }
            if (item.value === "delay") {
              setInput("");
              setMode("delay");
              return;
            }
            if (item.value === "delete") {
              setMode("confirmDelete");
              return;
            }
            if (item.value === "launch") {
              onNavigate({ type: "launch", slug });
              return;
            }
            if (item.value.startsWith("del:")) {
              const idx = parseInt(item.value.slice(4));
              const newItems = [...profile.items];
              newItems.splice(idx, 1);
              persist({ ...profile, items: newItems });
              setFeedback({ msg: "\xC9l\xE9ment supprim\xE9", ok: true });
            }
          },
          onCancel: onBack,
          hint: "\u2191\u2193 naviguer  \xB7  \u21B5 s\xE9lectionner  \xB7  Esc retour"
        }
      )
    ] })
  ] });
}

// src/screens/CreateProfileScreen.tsx
import { useState as useState5 } from "react";
import { Box as Box7, Text as Text7, useInput as useInput5 } from "ink";
import TextInput3 from "ink-text-input";
import { jsx as jsx7, jsxs as jsxs7 } from "react/jsx-runtime";
function CreateProfileScreen({ onBack, onNavigate }) {
  const [name, setName] = useState5("");
  const [error, setError] = useState5("");
  useInput5((_, key) => {
    if (key.escape) onBack();
  });
  return /* @__PURE__ */ jsxs7(Box7, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx7(Header, { subtitle: "Nouveau profil" }),
    /* @__PURE__ */ jsxs7(Box7, { flexDirection: "column", paddingX: 2, gap: 1, children: [
      /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "Choisissez un nom pour votre profil." }),
      /* @__PURE__ */ jsxs7(Box7, { gap: 1, children: [
        /* @__PURE__ */ jsx7(Text7, { color: "cyan", children: "\u203A" }),
        /* @__PURE__ */ jsx7(
          TextInput3,
          {
            value: name,
            onChange: (v) => {
              setName(v);
              setError("");
            },
            placeholder: "ex: Travail, Perso, Dev\u2026",
            onSubmit: (val) => {
              if (!val.trim()) {
                setError("Le nom ne peut pas \xEAtre vide.");
                return;
              }
              const slug = createProfile(val.trim());
              onNavigate({ type: "editProfile", slug });
            }
          }
        )
      ] }),
      error && /* @__PURE__ */ jsxs7(Text7, { color: "red", children: [
        "\u2716  ",
        error
      ] }),
      /* @__PURE__ */ jsx7(Text7, { dimColor: true, children: "\u21B5 cr\xE9er  \xB7  Esc annuler" })
    ] })
  ] });
}

// src/screens/LaunchScreen.tsx
import { useState as useState6, useEffect as useEffect4 } from "react";
import { Box as Box8, Text as Text8, useApp as useApp2, useInput as useInput6 } from "ink";
import Spinner from "ink-spinner";

// src/lib/launch.ts
import { exec } from "child_process";
function launchItem(type, cmd, browser) {
  const shell = type === "url" ? `${browser} "${cmd.replace(/"/g, '\\"')}" >/dev/null 2>&1 &` : `nohup ${cmd} >/dev/null 2>&1 &`;
  exec(shell);
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// src/screens/LaunchScreen.tsx
import { Fragment as Fragment2, jsx as jsx8, jsxs as jsxs8 } from "react/jsx-runtime";
function ProgressBar({ value, total, width = 36 }) {
  const filled = total > 0 ? Math.round(value / total * width) : 0;
  return /* @__PURE__ */ jsxs8(Box8, { children: [
    /* @__PURE__ */ jsx8(Text8, { color: "cyan", children: "\u2588".repeat(filled) }),
    /* @__PURE__ */ jsx8(Text8, { dimColor: true, children: "\u2591".repeat(width - filled) }),
    /* @__PURE__ */ jsxs8(Text8, { dimColor: true, children: [
      "  ",
      value,
      "/",
      total
    ] })
  ] });
}
function LaunchScreen({ slug, onDone }) {
  const { exit } = useApp2();
  void exit;
  const profile = readProfile(slug);
  const settings2 = loadSettings();
  const [states, setStates] = useState6(
    () => (profile?.items ?? []).map(() => "pending")
  );
  const [done, setDone] = useState6(false);
  useEffect4(() => {
    if (!profile || profile.items.length === 0) {
      setDone(true);
      return;
    }
    const delay = parseFloat(profile.delay ?? settings2.delay) * 1e3;
    (async () => {
      for (let i = 0; i < profile.items.length; i++) {
        setStates((s) => s.map((v, idx) => idx === i ? "running" : v));
        const item = profile.items[i];
        launchItem(item.type, item.cmd, settings2.browser);
        await sleep(Math.max(100, delay));
        setStates((s) => s.map((v, idx) => idx === i ? "done" : v));
      }
      setDone(true);
    })();
  }, []);
  useInput6((input, key) => {
    if (done && (key.return || key.escape || input.toLowerCase() === "q")) {
      onDone();
    }
  });
  if (!profile) {
    return /* @__PURE__ */ jsxs8(Box8, { flexDirection: "column", children: [
      /* @__PURE__ */ jsx8(Header, {}),
      /* @__PURE__ */ jsx8(Box8, { paddingX: 2, children: /* @__PURE__ */ jsxs8(Text8, { color: "red", children: [
        "\u2716  Profil introuvable : ",
        slug
      ] }) })
    ] });
  }
  const doneCount = states.filter((s) => s === "done").length;
  return /* @__PURE__ */ jsxs8(Box8, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx8(Header, { subtitle: `Lancement \xB7 ${profile.name}` }),
    /* @__PURE__ */ jsx8(Box8, { flexDirection: "column", paddingX: 2, children: profile.items.length === 0 ? /* @__PURE__ */ jsx8(Box8, { children: /* @__PURE__ */ jsx8(Text8, { color: "yellow", children: "\u26A0  Ce profil ne contient aucun \xE9l\xE9ment." }) }) : /* @__PURE__ */ jsxs8(Fragment2, { children: [
      profile.items.map((item, i) => {
        const st = states[i] ?? "pending";
        return /* @__PURE__ */ jsxs8(Box8, { gap: 1, children: [
          st === "done" && /* @__PURE__ */ jsx8(Text8, { color: "green", children: "\u2714" }),
          st === "running" && /* @__PURE__ */ jsx8(Text8, { color: "cyan", children: /* @__PURE__ */ jsx8(Spinner, { type: "dots" }) }),
          st === "pending" && /* @__PURE__ */ jsx8(Text8, { dimColor: true, children: "\u25CB" }),
          /* @__PURE__ */ jsx8(
            Text8,
            {
              bold: st === "running",
              color: st === "done" ? void 0 : st === "running" ? "cyan" : void 0,
              dimColor: st === "pending",
              children: item.label
            }
          ),
          /* @__PURE__ */ jsxs8(Text8, { dimColor: true, children: [
            item.type === "url" ? "\u{1F517}" : "\u2699 ",
            "  ",
            item.cmd
          ] })
        ] }, i);
      }),
      /* @__PURE__ */ jsx8(Box8, { marginTop: 1, children: /* @__PURE__ */ jsx8(ProgressBar, { value: doneCount, total: profile.items.length }) }),
      /* @__PURE__ */ jsx8(Box8, { marginTop: 1, children: done ? /* @__PURE__ */ jsxs8(Text8, { color: "green", children: [
        "\u2714  ",
        doneCount,
        " \xE9l\xE9ment",
        doneCount !== 1 ? "s" : "",
        " lanc\xE9",
        doneCount !== 1 ? "s" : "",
        "  ",
        /* @__PURE__ */ jsx8(Text8, { dimColor: true, children: "\u21B5 / Esc pour continuer" })
      ] }) : /* @__PURE__ */ jsx8(Text8, { dimColor: true, children: "Lancement en cours\u2026" }) })
    ] }) })
  ] });
}

// src/screens/HelpScreen.tsx
import { Box as Box9, Text as Text9, useInput as useInput7 } from "ink";
import { jsx as jsx9, jsxs as jsxs9 } from "react/jsx-runtime";
function Row({ cmd, desc }) {
  return /* @__PURE__ */ jsxs9(Box9, { gap: 1, children: [
    /* @__PURE__ */ jsx9(Text9, { color: "cyan", bold: true, children: cmd.padEnd(20) }),
    /* @__PURE__ */ jsx9(Text9, { dimColor: true, children: desc })
  ] });
}
function HelpScreen({ onBack }) {
  useInput7((input, key) => {
    if (key.escape || key.return || input === "q") onBack();
  });
  return /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", children: [
    /* @__PURE__ */ jsx9(Header, { subtitle: "Aide" }),
    /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", paddingX: 2, gap: 1, children: [
      /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", children: [
        /* @__PURE__ */ jsx9(Text9, { bold: true, children: "Usage" }),
        /* @__PURE__ */ jsx9(Text9, { dimColor: true, children: "  autobash [OPTIONS] [PROFIL]" })
      ] }),
      /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", gap: 0, children: [
        /* @__PURE__ */ jsx9(Text9, { bold: true, children: "Options" }),
        /* @__PURE__ */ jsx9(Row, { cmd: "  [PROFIL]", desc: "Lance directement un profil (slug ou nom)" }),
        /* @__PURE__ */ jsx9(Row, { cmd: "  -c, --configure", desc: "Ouvre le menu de configuration" }),
        /* @__PURE__ */ jsx9(Row, { cmd: "  -s, --settings", desc: "Ouvre les param\xE8tres globaux" }),
        /* @__PURE__ */ jsx9(Row, { cmd: "  -p, --profiles", desc: "Gestion des profils" }),
        /* @__PURE__ */ jsx9(Row, { cmd: "  -l, --list", desc: "Liste tous les profils" }),
        /* @__PURE__ */ jsx9(Row, { cmd: "  -n, --new", desc: "Cr\xE9e un nouveau profil" }),
        /* @__PURE__ */ jsx9(Row, { cmd: "  -h, --help", desc: "Affiche cette aide" }),
        /* @__PURE__ */ jsx9(Row, { cmd: "  -v, --version", desc: "Affiche la version" })
      ] }),
      /* @__PURE__ */ jsxs9(Box9, { flexDirection: "column", gap: 0, children: [
        /* @__PURE__ */ jsx9(Text9, { bold: true, children: "Exemples" }),
        /* @__PURE__ */ jsxs9(Text9, { dimColor: true, children: [
          "  autobash              ",
          /* @__PURE__ */ jsx9(Text9, { color: "cyan", children: "\u2192" }),
          "  menu principal"
        ] }),
        /* @__PURE__ */ jsxs9(Text9, { dimColor: true, children: [
          "  autobash travail      ",
          /* @__PURE__ */ jsx9(Text9, { color: "cyan", children: "\u2192" }),
          '  lance le profil "travail"'
        ] }),
        /* @__PURE__ */ jsxs9(Text9, { dimColor: true, children: [
          "  autobash --new        ",
          /* @__PURE__ */ jsx9(Text9, { color: "cyan", children: "\u2192" }),
          "  cr\xE9e un profil"
        ] }),
        /* @__PURE__ */ jsxs9(Text9, { dimColor: true, children: [
          "  autobash --list       ",
          /* @__PURE__ */ jsx9(Text9, { color: "cyan", children: "\u2192" }),
          "  liste les profils"
        ] })
      ] }),
      /* @__PURE__ */ jsxs9(Box9, { children: [
        /* @__PURE__ */ jsx9(Text9, { dimColor: true, children: "Config : " }),
        /* @__PURE__ */ jsx9(Text9, { dimColor: true, color: "cyan", children: CONFIG_DIR })
      ] }),
      /* @__PURE__ */ jsx9(Box9, { children: /* @__PURE__ */ jsx9(Text9, { dimColor: true, children: "\u2500".repeat(44) }) }),
      /* @__PURE__ */ jsx9(Box9, { children: /* @__PURE__ */ jsx9(Text9, { dimColor: true, children: "Esc  \xB7  \u21B5  \xB7  q  \u2192  retour" }) })
    ] })
  ] });
}

// src/App.tsx
import { jsx as jsx10, jsxs as jsxs10 } from "react/jsx-runtime";
function App({ initialScreen: initialScreen2 }) {
  const [stack, setStack] = useState7([initialScreen2 ?? { type: "main" }]);
  const current = stack[stack.length - 1];
  const push = (screen) => setStack((s) => [...s, screen]);
  const pop = () => setStack((s) => s.length > 1 ? s.slice(0, -1) : s);
  const replace = (screen) => setStack((s) => [...s.slice(0, -1), screen]);
  return /* @__PURE__ */ jsxs10(Box10, { flexDirection: "column", children: [
    current.type === "main" && /* @__PURE__ */ jsx10(MainMenu, { onNavigate: push }),
    current.type === "settings" && /* @__PURE__ */ jsx10(SettingsScreen, { onBack: pop }),
    current.type === "profiles" && /* @__PURE__ */ jsx10(ProfilesScreen, { onNavigate: (screen) => {
      if (screen.type === "createProfile") push(screen);
      else push(screen);
    }, onBack: pop }),
    current.type === "editProfile" && /* @__PURE__ */ jsx10(
      EditProfileScreen,
      {
        slug: current.slug,
        onBack: pop,
        onNavigate: (screen) => {
          if (screen.type === "editProfile") replace(screen);
          else push(screen);
        }
      }
    ),
    current.type === "createProfile" && /* @__PURE__ */ jsx10(
      CreateProfileScreen,
      {
        onBack: pop,
        onNavigate: (screen) => replace(screen)
      }
    ),
    current.type === "launch" && /* @__PURE__ */ jsx10(LaunchScreen, { slug: current.slug, onDone: pop }),
    current.type === "help" && /* @__PURE__ */ jsx10(HelpScreen, { onBack: pop })
  ] });
}

// src/cli.tsx
import { jsx as jsx11 } from "react/jsx-runtime";
initConfig();
var settings = loadSettings();
var args = process.argv.slice(2);
var arg = args[0] ?? "";
if (arg === "-v" || arg === "--version") {
  process.stdout.write(`autobash v${VERSION}
`);
  process.exit(0);
}
if (arg === "-l" || arg === "--list") {
  const slugs = listProfiles();
  if (slugs.length === 0) {
    process.stdout.write("  Aucun profil cr\xE9\xE9.\n");
  } else {
    process.stdout.write("\n  Profils disponibles :\n\n");
    for (const slug of slugs) {
      const p = readProfile(slug);
      const count = p?.items.length ?? 0;
      process.stdout.write(`  \u2022 ${p?.name ?? slug}  (${slug}, ${count} \xE9l\xE9ment${count !== 1 ? "s" : ""})
`);
    }
    process.stdout.write("\n");
  }
  process.exit(0);
}
var initialScreen;
if (arg === "-c" || arg === "--configure" || arg === "") {
  if (!arg && settings.defaultProfile && profileExists(settings.defaultProfile)) {
    initialScreen = { type: "launch", slug: settings.defaultProfile };
  } else {
    initialScreen = { type: "main" };
  }
} else if (arg === "-s" || arg === "--settings") {
  initialScreen = { type: "settings" };
} else if (arg === "-p" || arg === "--profiles") {
  initialScreen = { type: "profiles" };
} else if (arg === "-n" || arg === "--new") {
  initialScreen = { type: "createProfile" };
} else if (arg === "-h" || arg === "--help") {
  initialScreen = { type: "help" };
} else {
  if (profileExists(arg)) {
    initialScreen = { type: "launch", slug: arg };
  } else {
    const found = findProfileByName(arg);
    if (found) {
      initialScreen = { type: "launch", slug: found };
    } else {
      process.stderr.write(`  \u2716  Profil "${arg}" introuvable.
  Utilisez autobash --list pour voir les profils disponibles.
`);
      process.exit(1);
    }
  }
}
var { waitUntilExit } = render(/* @__PURE__ */ jsx11(App, { initialScreen }), {
  exitOnCtrlC: true
});
waitUntilExit().then(() => process.exit(0)).catch(() => process.exit(1));
