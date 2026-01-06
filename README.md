# Fish Tracker for CosmosMC

![License](https://img.shields.io/github/license/PetarMc1/fish-tracker?cacheSeconds=1000)
[![Discord](https://img.shields.io/discord/1281676657169535097?logo=Discord&logoColor=white&label=Discord&labelColor=blue&color=green&cacheSeconds=10)
](https://discord.gg/Uah2dNRhFV)
![Release](https://img.shields.io/github/v/release/PetarMc1/fish-tracker?include_prereleases&label=Release)
![GitHub deployments](https://img.shields.io/github/deployments/PetarMc1/fish-tracker/production?label=Production%20Deployment)
![GitHub deployments](https://img.shields.io/github/deployments/PetarMc1/fish-tracker/preview?label=Staging%20Deployment)



A full-stack application to track and visualize fishing statistics on the [**CosmosMC Minecraft server**](https://cosmosmc.org).


## API (Backend)

- [Deployable with Docker](/backend/README.md#docker-deployment)
- Built using **Node.js**, **Express**, and **MongoDB**.
- Securely receives encrypted data and decrypts it on the server.
- Stores catch logs per user for later retrieval.
- Includes endpoints for:
  - Fish and crab submission
  - User registration and key storage
  - Fetching logs and statistics
- Detailed info [here](https://docs.petarmc.com/fish-tracker/backend)

## Frontend (Viewer)

- [Deployable with Docker](/frontend/README.md#docker-deployment)
- Built with **Next.js** and **TailwindCSS**.
- Real-time visualization of fish-catching data.
- Features:
  - Sorting, filtering, and searching
  - User summaries and stats
  - Secure login/logout
- Detailed info [here](https://docs.petarmc.com/fish-tracker/frontend)

## App (Desktop Logger)

> [!IMPORTANT]
> This desktop logger is incompatible with the recent [`id → name`](https://github.com/PetarMc1/fish-tracker/commit/6a14a2bab53005b810f13a7a93442255c498fbe1) API change and is no longer maintained. Use the maintained [**Fish Tracker Mod**](https://github.com/PetarMc1/fish-tracker-mod).

- Parses **Lunar Client logs** to detect fishing and crab catching events.
- Supports all fish types and rarities.
- Automatically encrypts catch data using **Fernet (AES 128-bit)**.
- Sends encrypted logs to the backend API in real time.
- Detailed info [here](https://docs.petarmc.com/fish-tracker/app)

## Security

- Uses **Fernet encryption** for secure end-to-end data protection.
- MongoDB stores only decrypted fish data; sensitive tokens are never stored in plaintext.

## Full Fish Rarity Mapping

| Tier | Rarity Names             | Log Prefixes / Example Text                                            | Description                       |
| ---- | ------------------------ | ---------------------------------------------------------------------- | --------------------------------- |
| 7    | Mythical                 | `INSANE CATCH!`, `NEW ENTRY! You caught a MYTHICAL <Fish>`             | Ultra rare / top-tier new fish    |
| 6    | Platinum                 | `LEGENDARY CATCH!`, `NEW ENTRY! You caught a PLATINUM <Fish>`          | Very rare / exceptional new fish  |
| 4    | Diamond                  | `EPIC CATCH!`, `NEW ENTRY! You caught a DIAMOND <Fish>`                | Rare / high-tier new fish         |
| 3    | Gold                     | `GREAT CATCH!`, `NEW ENTRY! You caught a GOLD <Fish>`                  | Above average / mid-tier new fish |
| 2    | Silver                   | `NICE CATCH!`, `NEW ENTRY! You caught a SILVER <Fish>`                 | Uncommon / low-mid new fish       |
| 1    | Bronze                   | `GOOD CATCH!`, `NEW ENTRY! You caught a BRONZE <Fish>`                 | Common / basic new fish           |
| 5    | Default (no tag/unknown) | `You caught a <Fish>`, `NEW ENTRY! You caught a <Fish>` (unknown tier) | Unknown rarity                    |

Rarity is set as a number to save database space and make it easier and faster to process.

## For CosmosMC Players

Want a reserved fishing spot?
Join my [discord](https://discord.gg/Uah2dNRhFV) and apply for a spot through the applications channel.

## License

[MIT License](/LICENSE). Not affiliated with [CosmosMC](https://cosmosmc.org).
