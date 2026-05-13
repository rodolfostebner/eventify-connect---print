import React, { useState, useEffect } from 'react';
import { X, Package, ChevronLeft, ChevronRight, Phone, User, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import type { Exhibitor, Product } from '../../../types';
import { getProducts } from '../../../services/productService';
import { createLead } from '../../../services/leadService';
import { SocialLinks } from './SocialLinks';
import { cn } from '../../../lib/utils';

// ─── Photo Carousel ────────────────────────────────────────────────────────────

function ProductPhotoCarousel({ photos }: { photos: string[] }) {
  const [index, setIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-[4/3] bg-neutral-100 rounded-xl flex items-center justify-center">
        <Package className="w-12 h-12 text-neutral-300" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100">
        <img src={photos[index]} alt="" className="w-full h-full object-cover" />
      </div>
      {photos.length > 1 && (
        <>
          <button
            onClick={() => setIndex(i => Math.max(0, i - 1))}
            disabled={index === 0}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white disabled:opacity-30 transition-opacity"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIndex(i => Math.min(photos.length - 1, i + 1))}
            disabled={index === photos.length - 1}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white disabled:opacity-30 transition-opacity"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="flex justify-center gap-1.5 mt-2">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-200',
                  i === index ? 'bg-neutral-900 w-4' : 'bg-neutral-300 w-1.5',
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Pre-sale Form ─────────────────────────────────────────────────────────────

interface PreSaleFormProps {
  product: Product;
  exhibitorId: string;
  primaryColor: string;
}

function PreSaleForm({ product, exhibitorId, primaryColor }: PreSaleFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitting(true);
    try {
      await createLead({
        product_id: product.id,
        exhibitor_id: exhibitorId,
        customer_name: name.trim(),
        customer_phone: phone.trim(),
      });
      setDone(true);
    } catch {
      toast.error('Erro ao registrar interesse. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="flex items-start gap-2 p-3 bg-green-50 rounded-xl border border-green-100 text-green-700 text-sm">
        <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
        <span>Interesse registrado! O expositor entrará em contato em breve.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
        Pré Venda — {product.name}
      </p>
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
        <input
          type="text"
          placeholder="Seu nome"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
        />
      </div>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
        <input
          type="tel"
          placeholder="Telefone / WhatsApp"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
          className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !name.trim() || !phone.trim()}
        className="w-full py-2 rounded-lg text-sm font-bold text-white transition-opacity disabled:opacity-50"
        style={{ backgroundColor: primaryColor }}
      >
        {submitting ? 'Enviando...' : 'Confirmar interesse'}
      </button>
    </form>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

interface ExhibitorCatalogModalProps {
  exhibitor: Exhibitor;
  eventStatus: 'pre' | 'live' | 'post';
  primaryColor?: string;
  onClose: () => void;
}

export function ExhibitorCatalogModal({
  exhibitor,
  eventStatus,
  primaryColor = '#171717',
  onClose,
}: ExhibitorCatalogModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activePreSaleId, setActivePreSaleId] = useState<string | null>(null);

  useEffect(() => {
    getProducts(exhibitor.id)
      .then(setProducts)
      .catch(() => toast.error('Erro ao carregar produtos'))
      .finally(() => setLoading(false));
  }, [exhibitor.id]);

  const canPreSale = eventStatus === 'pre';

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="relative w-full md:max-w-2xl bg-white rounded-t-2xl md:rounded-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: '92dvh' }}
      >
        {/* Handle bar — mobile only */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-200" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100 shrink-0">
          {exhibitor.logo_url ? (
            <img
              src={exhibitor.logo_url}
              className="w-10 h-10 rounded-lg object-contain bg-neutral-50 p-1 border border-neutral-100 shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-neutral-400" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-neutral-900 text-base leading-tight truncate">
              {exhibitor.name}
            </h2>
            {exhibitor.description && (
              <p className="text-xs text-neutral-500 line-clamp-1 leading-tight">
                {exhibitor.description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-100 transition-colors shrink-0"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        {/* Socials */}
        {(exhibitor.instagram_url || exhibitor.whatsapp || exhibitor.website_url) && (
          <div className="px-4 py-2 border-b border-neutral-50 shrink-0">
            <SocialLinks
              instagram={exhibitor.instagram_url ?? undefined}
              whatsapp={exhibitor.whatsapp ?? undefined}
              website={exhibitor.website_url ?? undefined}
              containerClassName="flex gap-2"
              buttonClassName="p-1.5 bg-neutral-50 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors"
            />
          </div>
        )}

        {/* Products */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-neutral-200 border-t-neutral-900 rounded-full animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-neutral-400">
              <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum produto cadastrado</p>
            </div>
          ) : (
            products.map(product => (
              <div
                key={product.id}
                className="border border-neutral-100 rounded-xl overflow-hidden bg-white shadow-sm"
              >
                <div className="p-3">
                  <ProductPhotoCarousel photos={product.photos} />
                </div>
                <div className="px-3 pb-3 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-neutral-900 text-sm leading-tight">
                      {product.name}
                    </h3>
                    {product.price != null && (
                      <span className="text-sm font-black text-neutral-900 shrink-0 whitespace-nowrap">
                        {product.price.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                      </span>
                    )}
                  </div>
                  {product.description && (
                    <p className="text-xs text-neutral-500 leading-relaxed">
                      {product.description}
                    </p>
                  )}
                  {canPreSale && (
                    <div>
                      {activePreSaleId === product.id ? (
                        <PreSaleForm
                          product={product}
                          exhibitorId={exhibitor.id}
                          primaryColor={primaryColor}
                        />
                      ) : (
                        <button
                          onClick={() => setActivePreSaleId(product.id)}
                          className="w-full py-2 rounded-lg text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-[0.98]"
                          style={{ backgroundColor: primaryColor }}
                        >
                          Pré Venda
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
