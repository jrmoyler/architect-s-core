import { Link } from "react-router-dom";
import { assetManifest } from "@/data/assetManifest";
import { spriteSheetRegistry } from "@/data/spriteSheetRegistry";

const groups = Object.entries(
  assetManifest.reduce<Record<string, typeof assetManifest>>((acc, asset) => {
    const key = asset.category;
    acc[key] = acc[key] ? [...acc[key], asset] : [asset];
    return acc;
  }, {})
);

export default function AssetBrowser() {
  return (
    <main className="min-h-screen p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-xs tracking-[0.4em] text-cyan glow-cyan">DEV ASSET BROWSER</p>
            <h1 className="font-display text-3xl text-gold glow-gold">Game Asset Manifest</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Active assets: {assetManifest.filter(asset => asset.selectedAsBest).length} · Sheets: {spriteSheetRegistry.length}
            </p>
          </div>
          <Link className="rounded border border-cyan/40 px-3 py-2 text-sm text-cyan hover:bg-cyan/10" to="/">
            Back to game
          </Link>
        </div>

        {assetManifest.length === 0 ? (
          <section className="panel p-6 text-sm text-muted-foreground">
            <p className="font-display text-lg text-gold">No imported assets yet.</p>
            <p className="mt-2">
              Place the attached ZIP contents in <code className="text-cyan">tmp/imported-assets/</code> or run
              <code className="mx-1 text-cyan">npm run assets:process -- /path/to/assets</code>.
            </p>
          </section>
        ) : (
          <div className="space-y-8">
            {groups.map(([category, assets]) => (
              <section key={category}>
                <h2 className="font-display mb-3 text-xl text-cyan">{category} ({assets.length})</h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {assets.map(asset => (
                    <article key={asset.id} className="panel overflow-hidden text-xs">
                      <img
                        src={asset.filePath}
                        alt={asset.canonicalName}
                        className="pixel h-32 w-full object-contain bg-black/30"
                        loading="lazy"
                      />
                      <div className="space-y-1 p-2">
                        <p className="line-clamp-1 font-display text-gold">{asset.canonicalName}</p>
                        <p className="line-clamp-1 font-mono text-[10px] text-muted-foreground">{asset.id}</p>
                        <p className="text-[10px]">Q {asset.qualityScore} · C {asset.confidence}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
