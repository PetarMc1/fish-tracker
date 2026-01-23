export default function Footer() {
  return (
    <footer className="mt-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:justify-between gap-6">
          <div>
            <div className="text-xl font-bold text-white">Fish Tracker</div>
            <div className="text-sm text-neutral-400 mt-1">Links for the Fish Tracker project</div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div>
              <div className="text-sm font-semibold text-neutral-300 mb-2">Project</div>
              <ul className="space-y-1 text-sm">
                <li><a href="/" className="text-neutral-400 hover:text-white">Home</a></li>
                <li><a href="https://docs.petarmc.com/fish-tracker" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">Docs</a></li>
                <li><a href="https://api.tracker.petarmc.com/api-docs" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">API Docs</a></li>
                <li><a href="/admin" className="text-neutral-400 hover:text-white">Admin</a></li>
              </ul>
            </div>

            <div>
              <div className="text-sm font-semibold text-neutral-300 mb-2">More</div>
              <ul className="space-y-1 text-sm">
                <li><a href="https://petarmc.com" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">My Site</a></li>
                <li><a href="https://github.com/PetarMc1/fish-tracker" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">GitHub</a></li>
                <li><a href="https://modrinth.com/user/PetarMc1" target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-white">Modrinth</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm text-neutral-500">© 2025-{new Date().getFullYear()}  Built by Petar_mc. Not affiliated with CosmosMC. </div>
        <div className="mt-6 text-sm text-neutral-400"> <a href="https://discord.gg/Uah2dNRhFV" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Join the Discord →</a></div>
      </div>
    </footer>
  );
}
