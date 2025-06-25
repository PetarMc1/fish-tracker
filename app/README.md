# Fish Tracker App

A desktop application that monitors Minecraft Lunar Client logs for fish and crab catches and sends encrypted data to a remote API.
(soon adding other minecraft launchers)

## Features

- Logs in real time all fish and crabs you catch.
- Supports all fish rarities.
- Detects new fish entries.
- Sends encrypted data to an API using Fernet encryption.

## Requirements

- Python 3.8 or later
- Internet connection (for key retrieval and data sending)

## Usage

1. Download the [latest stable version](https://github.com/PetarMc1/fish-tracker/releases) or [build from source](#build-executable-optional).
2. Launch the application.
3. Enter your User ID and Password.
4. Click Start Monitoring to begin.
5. The app will watch your lunarclient log file and send fish data to API

## Security

- Encryption: [Fernet](https://cryptography.io/en/latest/fernet/) (symmetric AES-based encryption).
- All transmissions are encrypted before leaving your device

## Installation

### Clone the Repository

```bash
git clone https://github.com/PetarMc1/fish-tracker
cd fish-tracker/app
```

### Install Dependencies

Install required Python packages:

```bash
pip install -r requirements.txt
```

### Build Executable (Optional)

If you want you can package the program into your Windows standalone `.exe` although its better to use the [stable version](https://github.com/PetarMc1/fish-tracker/releases).

```bash
pyinstaller --onefile --windowed --noconsole fish_logger.py
```

## Supported Log Patterns

- Fish Catches:

```
NICE CATCH! You caught a Fish.
NICE CATCH! You caught a Fish with a length of 10.1cm. (it just takes fish name)
```

- Augment Fish Catches:

```
NICE CATCH! Your Augments caught a Fish
NICE CATCH! Your Augments caught a Fish with a length of 19.8cm. (it just takes fish name)
```

- New entry fish catches:

```
NEW ENTRY! You caught a Bronze Fish for the first time.
```

- Crab:

```
FISHING ▶ You fished up a Crab!
```

## [Full Fish Rarity Mapping](/README.md#full-fish-rarity-mapping)

## [License](/README.md#license)
