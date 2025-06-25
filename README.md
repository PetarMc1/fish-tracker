# Fish Tracker for CosmosMC

![License](https://img.shields.io/github/license/PetarMc1/fish-tracker)
[![Discord](https://img.shields.io/discord/1281676657169535097?logo=Discord&logoColor=white&label=Discord&labelColor=blue&color=green&cacheSeconds=10)
](https://discord.gg/Uah2dNRhFV)

A full-stack application to track and visualize fishing statistics on the [**CosmosMC Minecraft server**](https://cosmosmc.org).


## App (Desktop Logger)
- Parses **Lunar Client logs** to detect fishing and crab catching events.
- Supports all fish types and rarities.
- Automatically encrypts catch data using **Fernet (AES 128-bit)**.
- Sends encrypted logs to the backend API in real time.
- Detailed info [here](/app/README.md)


## API (Backend)
- Built using **Node.js**, **Express**, and **MongoDB**.
- Securely receives encrypted data and decrypts it on the server.
- Stores catch logs per user for later retrieval.
- Includes endpoints for:
  - Fish and crab submission
  - User registration and key storage
  - Fetching logs and statistics
- Detailed info [here](/backend/README.md)


## Frontend (Viewer)
- Built with **Next.js** and **TailwindCSS**.
- Real-time visualization of fish-catching data.
- Features:
  - Sorting, filtering, and searching
  - User summaries and stats
  - Secure login/logout
- Detailed info [here](/frontend/README.md)



## Security
- Uses **Fernet encryption** for secure end-to-end data protection.
- MongoDB stores only decrypted fish data; sensitive tokens are never stored in plaintext.



## For CosmosMC Players
Want a reserved fishing spot?
Join my [discord](https://discord.gg/Uah2dNRhFV) and apply for a spot through the applications channel.

## License
[MIT License](/LICENSE). Not affiliated with [CosmosMC](https://cosmosmc.org).
