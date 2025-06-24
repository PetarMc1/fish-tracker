import os
import re
import time
import json

import threading
import requests
import tkinter as tk
from tkinter import font, messagebox
from cryptography.fernet import Fernet

USER_HOME = os.path.expanduser("~")
LOG_PATH = os.path.join(USER_HOME, ".lunarclient", "offline", "multiver", "logs", "latest.log")

PATTERN_FISH = re.compile(
    r"(EPIC|GREAT|NICE|GOOD|LEGENDARY|INSANE)? ?CATCH! (?:Your Augments caught|You caught) (?:a|an) ([^!]+?)(?: with a length of [\d.]+cm)?[.!]",
    re.IGNORECASE
)
PATTERN_CRAB = re.compile(r"FISHING ▶ You fished up a ([^!]+)!", re.IGNORECASE)
PATTERN_NEW_ENTRY = re.compile(r"NEW ENTRY! You caught (?:a|an) (.+?) for the first time[.!]", re.IGNORECASE)

RARITY_MAP = {
    "GOOD": 1, "NICE": 2, "GREAT": 3, "EPIC": 4, "LEGENDARY": 6, "INSANE": 7
}
NEW_ENTRY_RARITY = {
    "BRONZE": 1, "SILVER": 2, "GOLD": 3, "DIAMOND": 4, "PLATINUM": 6, "MYTHICAL": 7
}

class FishMonitorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Fish & Crab Monitor")
        self.root.geometry("560x300")
        self.root.configure(bg="#121212")

        self.monitoring = False
        self.thread = None
        self.fernet = None

        self.status_var = tk.StringVar(value="Status: Idle")

        self._init_fonts()
        self._build_ui()

    def _init_fonts(self):
        self.header_font = font.Font(family="Segoe UI", size=16, weight="bold")
        self.body_font = font.Font(family="Segoe UI", size=11)
        self.status_font = font.Font(family="Segoe UI", size=12, slant="italic")

    def _build_ui(self):
        self._make_label("Fish Monitor", self.header_font).pack(pady=(10, 4))

        tk.Label(self.root, text="User ID:", font=self.body_font, bg="#121212", fg="#E0E0E0").pack()
        self.id_entry = tk.Entry(self.root, font=self.body_font)
        self.id_entry.pack(pady=(0, 8))

        tk.Label(self.root, text="Password:", font=self.body_font, bg="#121212", fg="#E0E0E0").pack()
        self.password_entry = tk.Entry(self.root, font=self.body_font, show="*")
        self.password_entry.pack(pady=(0, 8))

        tk.Label(self.root, text=f"Log File:\n{LOG_PATH}", font=self.body_font, bg="#121212", fg="#E0E0E0", wraplength=520).pack(pady=(4, 4))
        self.status_label = self._make_label("", self.status_font, textvariable=self.status_var)
        self.status_label.pack(pady=4)

        self.start_button = self._make_button("Start Monitoring", "#388E3C", self.start_monitoring)
        self.start_button.pack(pady=(5, 4))

        self.stop_button = self._make_button("Stop Monitoring", "#D32F2F", self.stop_monitoring, "disabled")
        self.stop_button.pack()

    def _make_label(self, text="", font=None, textvariable=None, wraplength=None):
        return tk.Label(
            self.root,
            text=text,
            textvariable=textvariable,
            font=font,
            wraplength=wraplength,
            bg="#121212",
            fg="#E0E0E0",
            anchor="center"
        )

    def _make_button(self, text, bg, command=None, state="normal"):
        return tk.Button(
            self.root,
            text=text,
            font=self.body_font,
            bg=bg,
            fg="#ffffff",
            activebackground="#1F1F1F",
            activeforeground="#ffffff",
            relief=tk.FLAT,
            padx=10,
            pady=6,
            bd=0,
            command=command,
            state=state,
            highlightthickness=0
        )

    def fetch_fernet_key(self, user_id, password):
        try:
            url = f"https://api.tracker.458011.xyz/get/user/key?id={user_id}&password={password}"
            resp = requests.get(url)
            if resp.status_code != 200:
                raise Exception(f"Status {resp.status_code}")

            key_data = resp.json()
            fernet_key = key_data.get("fernetKey")
            if not fernet_key:
                raise Exception("fernetKey not found in response")

            return Fernet(fernet_key)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to get encryption key:\n{e}")
            return None

    def start_monitoring(self):
        user_id = self.id_entry.get().strip()
        password = self.password_entry.get().strip()
        if not user_id or not password:
            messagebox.showerror("Error", "ID and Password are required.")
            return

        fernet = self.fetch_fernet_key(user_id, password)
        if not fernet:
            return

        self.user_id = user_id
        self.fernet = fernet
        self.monitoring = True

        self.status_var.set("Status: Monitoring...")
        self.start_button.config(state="disabled")
        self.stop_button.config(state="normal")

        self.thread = threading.Thread(target=self.monitor_log, daemon=True)
        self.thread.start()

    def stop_monitoring(self):
        self.monitoring = False
        self.status_var.set("Status: Stopped")
        self.start_button.config(state="normal")
        self.stop_button.config(state="disabled")

    def send_to_endpoint(self, path, data):
        try:
            encrypted = self.fernet.encrypt(json.dumps(data).encode("utf-8"))
            url = f"https://api.tracker.458011.xyz/post/{path}?id={self.user_id}"
            headers = {"Content-Type": "application/octet-stream"}
            requests.post(url, data=encrypted, headers=headers)
        except:
            pass

    def monitor_log(self):
        try:
            with open(LOG_PATH, "r", encoding="utf-8") as f:
                f.seek(0, 2)

                while self.monitoring:
                    line = f.readline()
                    if not line:
                        time.sleep(0.1)
                        continue

                    match = PATTERN_FISH.search(line)
                    if match:
                        rarity_key = (match.group(1) or "").strip().upper()
                        fish_name = match.group(2).strip()
                        rarity = RARITY_MAP.get(rarity_key, 5)
                        self.send_to_endpoint("fish", {"fish": fish_name, "rarity": rarity})

                    match = PATTERN_NEW_ENTRY.search(line)
                    if match:
                        full = match.group(1).strip().split(" ", 1)
                        word = full[0].upper()
                        fish_name = full[1] if len(full) > 1 else match.group(1).strip()
                        rarity = NEW_ENTRY_RARITY.get(word, 5)
                        self.send_to_endpoint("fish", {"fish": fish_name, "rarity": rarity})

                    match = PATTERN_CRAB.search(line)
                    if match:
                        self.send_to_endpoint("crab", {"fish": "crab"})

        except FileNotFoundError:
            self.status_var.set("Status: Log file not found.")
            messagebox.showerror("Error", f"Log file not found:\n{LOG_PATH}")
        except Exception as e:
            self.status_var.set("Status: Error")
            messagebox.showerror("Error", f"Unexpected error:\n{e}")


if __name__ == "__main__":
    root = tk.Tk()
    app = FishMonitorApp(root)
    root.mainloop()
