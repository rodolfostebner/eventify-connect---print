import { useState } from "react";
import { toast } from "sonner";
import { createContactLead } from "../../../services/contactLeadService";
import { PixCard } from "./PixCard";

interface ContactFormProps {
  isDark: boolean;
}

export function ContactForm({ isDark }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    event_name: "",
  });
  const [loading, setLoading] = useState(false);

  const logoSrc = isDark ? "/landing/Logo5.png" : "/landing/Logo0.png";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.event_name
    ) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      await createContactLead(formData);
      toast.success(
        "Solicitação enviada com sucesso! Nossa equipe entrará em contato em breve.",
      );
      setFormData({
        name: "",
        email: "",
        phone: "",
        event_name: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar solicitação. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (clean.length === 0) return "";
    if (clean.length <= 2) return `(${clean}`;
    if (clean.length <= 6) return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
    if (clean.length <= 10)
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <section
      id="contato"
      className="py-14 px-6 border-t border-[#E5A899]/20 dark:border-[#E5A899]/10 relative bg-[#FAF6F0] dark:bg-[#12110F] overflow-hidden transition-colors duration-300 scroll-mt-20 lg:scroll-mt-24"
    >
      {/* Elegant Full Block Bamboo Background Decor for Contact Section (Visual Bookend) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none z-0 overflow-hidden">
        <img
          src="/landing/telas/BAMBUZAL2.png"
          alt="Bamboo Contact Backdrop"
          className="w-full h-full object-cover opacity-10 mix-blend-multiply dark:mix-blend-screen dark:opacity-8 bamboo-bg-anim"
        />
      </div>
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="glass-card p-12 rounded-[40px] border border-[#E5A899]/20 dark:border-[#E5A899]/15 text-center relative overflow-hidden bg-white/60 dark:bg-[#181614]/75 transition-colors duration-300">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-[#F0A795]/10 dark:bg-[#F0A795]/5 rounded-full filter blur-[60px] pointer-events-none transition-colors duration-500"></div>
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-[#E5A899]/10 dark:bg-[#E5A899]/5 rounded-full filter blur-[60px] pointer-events-none transition-colors duration-500"></div>

          {/* Beautiful Large Koala Logo in form */}
          <img
            src={logoSrc}
            alt="Eventify Koala Logo"
            className="h-28 md:h-32 mx-auto mb-6 object-contain"
          />

          <h2 className="font-outfit font-extrabold text-4xl md:text-5xl mb-4 text-gray-900 dark:text-white leading-tight">
            Leve a experiência do Memories Hub para o seu evento, feira ou exposição.
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Transforme seu evento físico em uma experiência phygital interativa.
            Fale com um Especialista da nossa equipe.
          </p>

          {/* Form inputs */}
          <form className="space-y-4 max-w-md mx-auto" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nome Completo"
                required
                disabled={loading}
                className="w-full bg-white/80 dark:bg-[#201C1A]/85 border border-[#E5A899]/30 dark:border-[#E5A899]/20 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#F0A795] transition-colors"
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="E-mail"
                required
                disabled={loading}
                className="w-full bg-white/80 dark:bg-[#201C1A]/85 border border-[#E5A899]/30 dark:border-[#E5A899]/20 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#F0A795] transition-colors"
              />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Telefone / WhatsApp"
                required
                disabled={loading}
                className="w-full bg-white/80 dark:bg-[#201C1A]/85 border border-[#E5A899]/30 dark:border-[#E5A899]/20 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#F0A795] transition-colors"
              />
              <input
                type="text"
                name="event_name"
                value={formData.event_name}
                onChange={handleChange}
                placeholder="Nome do Evento"
                required
                disabled={loading}
                className="w-full bg-white/80 dark:bg-[#201C1A]/85 border border-[#E5A899]/30 dark:border-[#E5A899]/20 rounded-2xl px-5 py-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#F0A795] transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white dark:text-gray-900 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-md transform hover:-translate-y-0.5 mt-2 disabled:opacity-55"
            >
              {loading ? "Enviando..." : "Fale com um Especialista"}
            </button>
          </form>
        </div>
      </div>

      <PixCard />
    </section>
  );
}
