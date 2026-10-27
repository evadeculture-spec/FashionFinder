import { useRef, useState } from 'react';
import { ImagePlus, ScanLine, X } from 'lucide-react';
import { INSPIRATIONS } from '@/data/outfits';
import { CATEGORIES, colourById } from '@/data/taxonomy';
import type { CategoryId, ColourId } from '@/data/types';
import { analyseImageColours, intentFromInspiration, intentFromUpload } from '@/services/search/visual';
import type { ParsedIntent } from '@/services/search/types';
import { SmartImage } from '@/components/ui/SmartImage';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { SimulatedNote } from '@/components/ui/misc';
import { cx } from '@/lib/format';

/** Kept in memory so the results header can show the uploaded preview. */
export const uploadedPreview: { src: string | null } = { src: null };

export function VisualSearch({ onSearch }: { onSearch: (intent: ParsedIntent, imageRef: string) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [upload, setUpload] = useState<{ src: string; colours: ColourId[]; analysing: boolean } | null>(null);
  const [uploadCat, setUploadCat] = useState<CategoryId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const insp = INSPIRATIONS.find((i) => i.id === selected);
  const preview = upload?.src ?? insp?.image;

  const onFile = async (file?: File) => {
    setError(null);
    if (!file) return;
    if (!file.type.startsWith('image/')) return setError('Escolhe um ficheiro de imagem (JPG, PNG, WEBP ou HEIC).');
    if (file.size > 12 * 1024 * 1024) return setError('A imagem é demasiado grande (máx. 12 MB).');
    const src = URL.createObjectURL(file);
    setSelected(null);
    setUpload({ src, colours: [], analysing: true });
    const colours = await analyseImageColours(src);
    setUpload({ src, colours, analysing: false });
  };

  const run = () => {
    if (upload) {
      uploadedPreview.src = upload.src;
      onSearch(intentFromUpload(uploadCat, upload.colours), 'upload');
    } else if (selected) {
      const intent = intentFromInspiration(selected);
      if (intent) onSearch(intent, selected);
    }
  };

  const clear = () => {
    setSelected(null);
    setUpload(null);
    setUploadCat(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] [&>*]:min-w-0">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl">Escolhe uma inspiração</h2>
          <Button variant="secondary" size="sm" icon={<ImagePlus size={15} />} onClick={() => fileRef.current?.click()}>
            Carregar imagem
          </Button>
          <input ref={fileRef} type="file" accept="image/*" className="sr-only" aria-label="Carregar imagem de inspiração" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
        {error && <p role="alert" className="mb-3 text-sm text-danger">{error}</p>}
        <div className="grid grid-cols-3 gap-2.5 md:gap-3">
          {INSPIRATIONS.map((i) => (
            <button
              key={i.id}
              onClick={() => {
                setUpload(null);
                setSelected(i.id);
              }}
              aria-pressed={selected === i.id}
              className={cx('group relative overflow-hidden rounded-card text-left ring-offset-2 ring-offset-ivory transition', selected === i.id ? 'ring-2 ring-ink' : 'hover:opacity-90')}
            >
              <SmartImage src={i.image} alt={i.title} category={i.detected.category} tint={colourById[i.detected.colours[0]].hex} className="aspect-[3/4]" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-2 pt-8 text-[12px] font-medium text-ivory">{i.title}</span>
            </button>
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-card border border-dashed border-line-strong bg-paper text-center text-[12.5px] text-muted hover:border-ink hover:text-ink"
          >
            <ImagePlus size={22} strokeWidth={1.5} />
            A tua imagem
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-card border border-line bg-paper p-4">
          {preview ? (
            <>
              <div className="relative overflow-hidden rounded-md">
                {upload ? (
                  <img src={upload.src} alt="Pré-visualização da imagem carregada" className="aspect-[4/5] w-full object-cover" />
                ) : (
                  <SmartImage src={preview} alt={insp?.title ?? ''} category={insp?.detected.category} className="aspect-[4/5]" />
                )}
                <div className="pointer-events-none absolute inset-x-4 h-0.5 animate-scan bg-clay/80 shadow-[0_0_18px_4px_rgba(200,120,91,0.45)] motion-reduce:hidden" aria-hidden />
                <button onClick={clear} aria-label="Remover imagem" className="absolute top-2 right-2 grid size-8 place-items-center rounded-full bg-paper/90 shadow-soft">
                  <X size={16} />
                </button>
              </div>

              {insp && (
                <div className="mt-3">
                  <p className="text-xs text-muted">Atributos de demonstração para esta imagem</p>
                  <p className="mt-1 text-sm">
                    <span className="font-semibold">{insp.detected.label}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {insp.detected.colours.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 rounded-chip bg-ivory px-2 py-0.5 text-xs">
                        <span className="size-2.5 rounded-full border border-black/10" style={{ background: colourById[c].hex }} /> {colourById[c].label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {upload && (
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="text-xs text-muted">Cores dominantes (análise local, no teu dispositivo)</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {upload.analysing ? (
                        <span className="text-xs">A analisar cores…</span>
                      ) : upload.colours.length ? (
                        upload.colours.map((c) => (
                          <span key={c} className="inline-flex items-center gap-1 rounded-chip bg-ivory px-2 py-0.5 text-xs">
                            <span className="size-2.5 rounded-full border border-black/10" style={{ background: colourById[c].hex }} /> {colourById[c].label}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs">Não foi possível detetar cores.</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs text-muted">Que tipo de peça procuras nesta imagem?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.map((c) => (
                        <Chip key={c.id} className="!h-8 !px-3 !text-xs" active={uploadCat === c.id} onClick={() => setUploadCat(uploadCat === c.id ? null : c.id)}>
                          {c.label}
                        </Chip>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <Button block className="mt-4" icon={<ScanLine size={16} />} onClick={run} disabled={upload?.analysing}>
                Encontrar peças semelhantes
              </Button>
            </>
          ) : (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <span className="mb-3 grid size-12 place-items-center rounded-full bg-sage-soft">
                <ScanLine size={20} />
              </span>
              <p className="font-display text-lg">Mostra-nos o que imaginas</p>
              <p className="mt-1 text-[13px] text-muted">Escolhe uma inspiração ou carrega uma fotografia de uma peça que viste.</p>
            </div>
          )}
        </div>
        <SimulatedNote className="mt-3">
          Pesquisa visual simulada: não há reconhecimento de imagem ligado. As imagens de inspiração têm atributos pré-definidos; nas tuas imagens só analisamos as cores, localmente — a imagem nunca sai do teu dispositivo.
        </SimulatedNote>
      </aside>
    </div>
  );
}
