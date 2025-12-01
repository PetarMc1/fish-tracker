import os
import re
import time
import json
import threading
import tkinter as tk
from tkinter import font, messagebox, scrolledtext, Toplevel, Label
from cryptography.fernet import Fernet
import requests
import sys

USER_HOME = os.path.expanduser("~")
LUNAR_LOG = os.path.join(USER_HOME, ".lunarclient", "profiles", "lunar", "1.21", "logs", "latest.log")
FEATHER_LOG = os.path.join(USER_HOME, "AppData", "Roaming", ".minecraft", "feather", "logs", "latest.log")

PATTERN_FISH = re.compile(
    r"(EPIC|GREAT|NICE|GOOD|LEGENDARY|INSANE)? ?CATCH! (?:Your Augments caught|You caught) (?:a|an) ([^!]+?)(?: with a length of [\d.]+cm)?[.!]",
    re.IGNORECASE
)
PATTERN_CRAB = re.compile(r"FISHING ▶ You fished up a ([^!]+)!", re.IGNORECASE)
PATTERN_NEW_ENTRY = re.compile(r"NEW ENTRY! You caught (?:a|an) (.+?) for the first time[.!]", re.IGNORECASE)

RARITY_MAP = {"GOOD":1,"NICE":2,"GREAT":3,"EPIC":4,"LEGENDARY":6,"INSANE":7}
NEW_ENTRY_RARITY = {"BRONZE":1,"SILVER":2,"GOLD":3,"DIAMOND":4,"PLATINUM":6,"MYTHICAL":7}

CONFIG_FILE = os.path.join(os.path.dirname(sys.argv[0]), "config.json")

class FishMonitorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Fish & Crab Monitor")
        self.root.geometry("700x600")
        self.root.configure(bg="#121212")
        self.monitoring = False
        self.fernet = None
        self.api_key = None
        self.debug = tk.BooleanVar(value=True)
        self.log_source = tk.StringVar(value="lunar")
        self.remember_credentials = tk.BooleanVar(value=False)
        self.current_log_path = LUNAR_LOG
        self.status_var = tk.StringVar(value="Status: Idle")
        self._init_fonts()
        self._build_ui()
        self.load_config()
        self.debug.trace_add("write", self.toggle_debug_mode)
        self.log_source.trace_add("write", self.change_log_source)

    def _init_fonts(self):
        self.header_font = font.Font(family="Segoe UI", size=16, weight="bold")
        self.body_font = font.Font(family="Segoe UI", size=11)
        self.status_font = font.Font(family="Segoe UI", size=12, slant="italic")

    def _build_ui(self):
        tk.Label(self.root, text="Fish & Crab Monitor", font=self.header_font, bg="#121212", fg="#E0E0E0").pack(pady=(10,10))
        login_frame = tk.Frame(self.root, bg="#121212")
        login_frame.pack(fill="x", padx=20, pady=5)
        tk.Label(login_frame, text="User ID:", bg="#121212", fg="#E0E0E0", font=self.body_font).grid(row=0,column=0, sticky="w")
        self.id_entry = tk.Entry(login_frame, font=self.body_font); self.id_entry.grid(row=0,column=1, pady=2, sticky="ew")
        tk.Label(login_frame, text="Password:", bg="#121212", fg="#E0E0E0", font=self.body_font).grid(row=1,column=0, sticky="w")
        self.password_entry = tk.Entry(login_frame, font=self.body_font, show="*"); self.password_entry.grid(row=1,column=1, pady=2, sticky="ew")
        login_frame.columnconfigure(1, weight=1)
        api_frame = tk.Frame(self.root, bg="#121212")
        api_frame.pack(fill="x", padx=20, pady=5)
        tk.Label(api_frame, text="Auth API Key:", bg="#121212", fg="#E0E0E0", font=self.body_font).grid(row=0,column=0, sticky="w")
        self.api_entry = tk.Entry(api_frame, font=self.body_font); self.api_entry.grid(row=0,column=1, pady=2, sticky="ew")
        api_frame.columnconfigure(1, weight=1)
        remember_frame = tk.Frame(self.root, bg="#121212")
        remember_frame.pack(fill="x", padx=20, pady=2)
        tk.Checkbutton(remember_frame, text="Remember Credentials", variable=self.remember_credentials,
                       bg="#121212", fg="#E0E0E0", font=self.body_font, selectcolor="#222222").pack(side="left")
        btn_help = tk.Button(remember_frame, text="?", bg="#555555", fg="white", font=("Segoe UI", 10),
                             command=self.show_remember_help)
        btn_help.pack(side="left", padx=5)
        log_frame = tk.LabelFrame(self.root, text="Log Source", font=self.body_font, bg="#121212", fg="#E0E0E0", labelanchor="n")
        log_frame.pack(fill="x", padx=20, pady=10)
        tk.Radiobutton(log_frame, text="Lunar Client", variable=self.log_source, value="lunar",
                       bg="#121212", fg="white", selectcolor="#1B1B1B", font=self.body_font).pack(anchor="w", padx=10, pady=2)
        tk.Radiobutton(log_frame, text="Feather Client", variable=self.log_source, value="feather",
                       bg="#121212", fg="white", selectcolor="#1B1B1B", font=self.body_font).pack(anchor="w", padx=10, pady=2)
        self.log_display = tk.Label(log_frame, text="", font=self.body_font, bg="#121212", fg="#E0E0E0", wraplength=650)
        self.log_display.pack(padx=10, pady=5)
        self.update_log_path_label()
        options_frame = tk.Frame(self.root, bg="#121212")
        options_frame.pack(fill="x", padx=20, pady=5)
        tk.Checkbutton(options_frame, text="Debug Mode", variable=self.debug,
                       bg="#121212", fg="#E0E0E0", font=self.body_font, selectcolor="#222222").pack(anchor="w")
        buttons_frame = tk.Frame(self.root, bg="#121212")
        buttons_frame.pack(pady=10)
        self.start_button = tk.Button(buttons_frame, text="Start Monitoring", font=self.body_font, bg="#388E3C", fg="#ffffff",
                                      padx=10, pady=6, relief="flat", command=self.start_monitoring)
        self.start_button.pack(side="left", padx=5)
        self.stop_button = tk.Button(buttons_frame, text="Stop Monitoring", font=self.body_font, bg="#D32F2F", fg="#ffffff",
                                     padx=10, pady=6, relief="flat", command=self.stop_monitoring, state="disabled")
        self.stop_button.pack(side="left", padx=5)
        tk.Label(self.root, textvariable=self.status_var, font=self.status_font, bg="#121212", fg="#E0E0E0").pack(pady=5)
        debug_frame = tk.LabelFrame(self.root, text="Debug Log", font=self.body_font, bg="#121212", fg="#E0E0E0")
        debug_frame.pack(fill="both", expand=True, padx=20, pady=10)
        self.debug_frame = debug_frame
        self.debug_text = scrolledtext.ScrolledText(debug_frame, font=("Consolas", 10), bg="#1B1B1B", fg="#E0E0E0")
        self.debug_text.pack(fill="both", expand=True, padx=5, pady=5)
        self.debug_text.config(state="disabled")

    def show_remember_help(self):
        win = Toplevel(self.root)
        win.title("Remember Credentials Info")
        Label(win, text="If checked, User ID and API Key will be saved in a local JSON file.\n"
                        "The file must stay with the EXE to preserve credentials.", justify="left").pack(padx=10, pady=10)

    def toggle_debug_mode(self, *args):
        if self.debug.get():
            self.debug_frame.pack(fill="both", expand=True, padx=20, pady=10)
            self.gui_debug("[DEBUG] Debug mode enabled.")
        else:
            self.debug_text.config(state="normal")
            self.debug_text.delete(1.0, tk.END)
            self.debug_text.config(state="disabled")
            self.debug_frame.pack_forget()

    def change_log_source(self, *args):
        self.current_log_path = LUNAR_LOG if self.log_source.get() == "lunar" else FEATHER_LOG
        self.update_log_path_label()
        self.gui_debug(f"[DEBUG] Log source switched to: {self.current_log_path}")
        if self.monitoring:
            self.gui_debug(f"[DEBUG] Will start monitoring {self.current_log_path} from end")

    def update_log_path_label(self):
        self.log_display.config(text=f"Log Path:\n{self.current_log_path}")

    def gui_debug(self, message):
        if self.debug.get():
            self.debug_text.config(state="normal")
            self.debug_text.insert(tk.END, message + "\n")
            self.debug_text.see(tk.END)
            self.debug_text.config(state="disabled")

    def load_config(self):
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                    cfg = json.load(f)
                    self.id_entry.insert(0, cfg.get("user_id",""))
                    self.api_entry.insert(0, cfg.get("api_key",""))
                    self.log_source.set(cfg.get("log_source","lunar"))
                    self.debug.set(cfg.get("debug", True))
                    self.remember_credentials.set(bool(cfg.get("user_id") and cfg.get("api_key")))
            except: pass

    def save_config(self):
        if self.remember_credentials.get():
            cfg = {
                "user_id": self.id_entry.get().strip(),
                "api_key": self.api_entry.get().strip(),
                "debug": self.debug.get(),
                "log_source": self.log_source.get()
            }
            try:
                with open(CONFIG_FILE, "w", encoding="utf-8") as f:
                    json.dump(cfg, f, indent=2)
            except: pass
        else:
            if os.path.exists(CONFIG_FILE):
                try: os.remove(CONFIG_FILE)
                except: pass

    def fetch_fernet_key(self, user_id, password):
        try:
            url = f"http://localhost:10000/get/user/key?id={user_id}&password={password}"
            resp = requests.get(url, headers={"x-api-key": self.api_key})
            self.gui_debug(f"[GET] {url} | Status {resp.status_code}")
            fk = resp.json().get("fernetKey")
            if not fk: raise Exception("No fernetKey returned")
            self.gui_debug("[DEBUG] Fernet Key Retrieved")
            return Fernet(fk)
        except Exception as e:
            messagebox.showerror("Error", f"Key Fetch Failed:\n{e}")
            self.gui_debug(f"[ERROR] Key Fetch Failed: {e}")
            return None

    def start_monitoring(self):
        user_id = self.id_entry.get().strip()
        password = self.password_entry.get().strip()
        self.api_key = self.api_entry.get().strip()
        if not user_id or not password or not self.api_key:
            messagebox.showerror("Error", "All fields required.")
            return
        self.fernet = self.fetch_fernet_key(user_id, password)
        if not self.fernet: return
        self.user_id = user_id
        self.monitoring = True
        self.start_button.config(state="disabled")
        self.stop_button.config(state="normal")
        self.status_var.set("Status: Monitoring...")
        self.thread = threading.Thread(target=self.monitor_log, daemon=True)
        self.thread.start()
        self.gui_debug("[DEBUG] Monitoring started.")

    def stop_monitoring(self):
        self.monitoring = False
        self.start_button.config(state="normal")
        self.stop_button.config(state="disabled")
        self.status_var.set("Status: Stopped")
        self.save_config()
        self.gui_debug("[DEBUG] Monitoring stopped.")

    def send_to_endpoint(self, path, data):
        try:
            encrypted = self.fernet.encrypt(json.dumps(data).encode())
            url = f"http://localhost:10000/post/{path}?id={self.user_id}"
            r = requests.post(url, data=encrypted, headers={"x-api-key": self.api_key})
            self.gui_debug(f"[POST] {url} → {data} | Status {r.status_code}")
        except Exception as e:
            self.gui_debug(f"[ERROR] Send Failed: {e}")

    def monitor_log(self):
        f = None
        try:
            while self.monitoring:
                if self.current_log_path:
                    if f is None or f.name != self.current_log_path:
                        if f: f.close()
                        f = open(self.current_log_path, "r", encoding="utf-8")
                        f.seek(0, 2)
                        self.gui_debug(f"[DEBUG] Watching log: {self.current_log_path} from end")
                line = f.readline() if f else ""
                if not line:
                    time.sleep(0.1)
                    continue
                m = PATTERN_FISH.search(line)
                if m:
                    rarity_key = (m.group(1) or "").upper()
                    fish = m.group(2).strip()
                    r = RARITY_MAP.get(rarity_key, 5)
                    self.gui_debug(f"[FISH] {fish} | Rarity {r}")
                    self.send_to_endpoint("fish", {"fish": fish, "rarity": r})
                m = PATTERN_NEW_ENTRY.search(line)
                if m:
                    parts = m.group(1).split(" ", 1)
                    r = NEW_ENTRY_RARITY.get(parts[0].upper(), 5)
                    fish = parts[1] if len(parts) > 1 else m.group(1)
                    self.gui_debug(f"[NEW ENTRY] {fish} | Rarity {r}")
                    self.send_to_endpoint("fish", {"fish": fish, "rarity": r})
                if PATTERN_CRAB.search(line):
                    self.gui_debug("[CRAB] Crab caught")
                    self.send_to_endpoint("crab", {"fish": "crab"})
        except FileNotFoundError:
            messagebox.showerror("Error", f"Log not found:\n{self.current_log_path}")
            self.gui_debug(f"[ERROR] Log not found: {self.current_log_path}")
        except Exception as e:
            messagebox.showerror("Error", str(e))
            self.gui_debug(f"[ERROR] {e}")
        finally:
            if f: f.close()

if __name__ == "__main__":
    root = tk.Tk()
    app = FishMonitorApp(root)
    root.mainloop()
