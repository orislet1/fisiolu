"use client";

import Image from "next/image";
import {
  CalendarDays,
  Check,
  ChevronRight,
  ChevronDown,
  Heart,
  Home as HomeIcon,
  Share2,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");

  const [form, setForm] = useState({
    tipoPaciente: "",
    nombre: "",
    telefono: "",
    distrito: "",
    direccion: "",
    area: "",
    semanas: "",
    servicio: "",
    motivo: "",
    fecha: "",
    hora: "",
    mensaje: "",
  });
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "tipoPaciente") {
      setForm({
        ...form,
        tipoPaciente: value,
        servicio:
          value === "Primera atención - Evaluación S/120"
            ? "Evaluación inicial"
            : value === "Paciente en tratamiento - Sesión S/170"
              ? "Sesión de tratamiento"
              : "",
        motivo: "",
      });
      return;
    }

    if (name === "area") {
      setForm({
        ...form,
        area: value,
        semanas: value === "Embarazo" ? form.semanas : "",
        motivo: "",
      });
      return;
    }

    setForm({
      ...form,
      [name]: value,
    });
  };
  
  useEffect(() => {
    if (!form.fecha) {
      setAvailableSlots([]);
      setAvailabilityError("");
      return;
    }

    const controller = new AbortController();

    const loadAvailability = async () => {
      try {
        setLoadingSlots(true);
        setAvailabilityError("");

        // Si cambia la fecha, la hora elegida anteriormente deja de ser válida.
        setForm((current) => ({
          ...current,
          hora: "",
        }));

        const response = await fetch(
          `/api/availability?date=${encodeURIComponent(form.fecha)}`,
          { signal: controller.signal }
        );

        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error("No se pudo consultar la disponibilidad");
        }

        const available = (data.slots ?? [])
          .filter(
            (slot: { time: string; available: boolean }) => slot.available
          )
          .map((slot: { time: string }) => slot.time);

        setAvailableSlots(available);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Error consultando disponibilidad:", error);
        setAvailableSlots([]);
        setAvailabilityError(
          "No pudimos consultar los horarios. Intenta nuevamente."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSlots(false);
        }
      }
    };

    loadAvailability();

    return () => controller.abort();
  }, [form.fecha]);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const response = await fetch("/api/book", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nombre: form.nombre,
        telefono: form.telefono,
        distrito: form.distrito,
        direccion: form.direccion,
        area: form.area,
        semanas: form.semanas,
        servicio: form.servicio,
        motivo: form.motivo,
        fecha: form.fecha,
        hora: form.hora,
        mensaje: form.mensaje,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(
        data.message ||
          "No se pudo crear la reserva. Intenta nuevamente."
      );
      return;
    }

    const texto = `
Hola, quiero confirmar mi reserva en FISIOLU.

Tipo: ${form.tipoPaciente}
Área: ${form.area}
${form.area === "Embarazo" ? `Semanas de embarazo: ${form.semanas}\n` : ""}
Servicio: ${form.servicio}
Motivo: ${form.motivo}

Nombre: ${form.nombre}
WhatsApp: ${form.telefono}
Distrito / Zona: ${form.distrito}
Dirección: ${form.direccion}

Fecha: ${form.fecha}
Hora: ${form.hora}

${form.mensaje ? `Mensaje: ${form.mensaje}` : ""}
    `.trim();

    const whatsappUrl = `https://wa.me/56976956928?text=${encodeURIComponent(
      texto
    )}`;

    window.open(whatsappUrl, "_blank");
  } catch (error) {
    console.error("Error al reservar:", error);

    alert(
      "Ocurrió un error al crear la reserva. Intenta nuevamente."
    );
  }
};
  const whatsapp =
    "https://wa.me/56976956928?text=Hola%20Milagros,%20quisiera%20agendar%20una%20cita.";

  const servicios = [
    {
      title: "Dolor de espalda",
      text: "Alivio del dolor lumbar y dorsal, mejora de la postura y movilidad.",
    },
    {
      title: "Dolor de coxis",
      text: "Evaluación y tratamiento para aliviar la presión y el dolor en el coxis.",
    },
    {
      title: "Dolor de pubis",
      text: "Técnicas específicas para reducir el dolor en la sínfisis del pubis.",
    },
    {
      title: "Incontinencia urinaria",
      text: "Fortalecimiento del suelo pélvico para prevenir pérdidas de orina.",
    },
    {
      title: "Preparación para el parto",
      text: "Preparación física y emocional para un parto más seguro y consciente.",
    },
  ];

  const motivosPorArea: Record<string, string[]> = {
    General: [
      "Incontinencia urinaria",
      "Urgencia urinaria / vejiga hiperactiva",
      "Debilidad del suelo pélvico",
      "Hipertonía / tensión del suelo pélvico",
      "Dolor pélvico",
      "Dolor perineal",
      "Dolor de coxis / coccigodinia",
      "Dolor lumbopélvico",
      "Dolor al sentarse",
      "Neuralgia / irritación del nervio pudendo",
      "Reeducación vesical",
      "Retención urinaria",
      "Estreñimiento asociado al suelo pélvico",
      "Otro",
    ],
    Femenina: [
      "Prolapso",
      "Dolor durante o después de las relaciones sexuales",
      "Vaginismo",
      "Dolor vulvar",
      "Recuperación postparto",
      "Cicatriz de cesárea o episiotomía",
      "Alteraciones abdominopélvicas",
      "Otro",
    ],
    Masculina: [
      "Recuperación después de prostatectomía",
      "Síndrome de dolor pélvico crónico",
      "Disfunción eréctil",
      "Eyaculación precoz",
      "Alteraciones de la función sexual masculina",
      "Otro",
    ],
    Embarazo: [
      "Preparación para el parto",
      "Dolor de pubis asociado al embarazo",
      "Molestias pélvicas asociadas al embarazo",
      "Otro",
    ],
    Neurologica: [
      "Alteraciones del control urinario de origen neurológico",
      "Alteraciones intestinales de origen neurológico",
      "Reeducación neuromuscular",
      "Coordinación abdominopélvica",
      "Respiración y diafragma",
      "Relajación y control del suelo pélvico",
      "Otro",
    ],
  };

  return (
    <main className="min-h-screen bg-white text-slate-800">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 lg:px-8">
          <a href="#inicio" className="flex items-center">
            <Image
              src="/logo-fisiolu-nuevo.png"
              alt="FISIOLU"
              width={170}
              height={100}
              className="h-auto w-[125px] md:w-[150px]"
              priority
            />
          </a>

          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            <a href="#inicio" className="transition hover:text-teal-600">
              Inicio
            </a>
            <a href="#servicios" className="transition hover:text-teal-600">
              Servicios
            </a>
            <a href="#beneficios" className="transition hover:text-teal-600">
              Beneficios
            </a>
            <a href="#sobre-mi" className="transition hover:text-teal-600">
              Sobre mí
            </a>
            <a href="#testimonios" className="transition hover:text-teal-600">
              Testimonios
            </a>
          </nav>

          <div className="hidden md:block">
            <a
              href="#agendar"
              className="inline-flex items-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <CalendarDays size={18} />
              Agenda tu evaluación
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-xl border border-slate-200 p-2 md:hidden"
            aria-label="Abrir menú"
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-slate-100 bg-white px-5 py-5 md:hidden">
            <div className="flex flex-col gap-4 font-medium">
              <a href="#inicio" onClick={() => setMenuOpen(false)}>
                Inicio
              </a>
              <a href="#servicios" onClick={() => setMenuOpen(false)}>
                Servicios
              </a>
              <a href="#beneficios" onClick={() => setMenuOpen(false)}>
                Beneficios
              </a>
              <a href="#sobre-mi" onClick={() => setMenuOpen(false)}>
                Sobre mí
              </a>
              <a href="#testimonios" onClick={() => setMenuOpen(false)}>
                Testimonios
              </a>

              <a
                href="#agendar"
                onClick={() => setMenuOpen(false)}
                className="mt-2 rounded-full bg-teal-600 px-5 py-3 text-center font-semibold text-white"
              >
                Agenda tu evaluación
              </a>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        id="inicio"
        className="scroll-mt-28 relative overflow-hidden bg-gradient-to-br from-white via-purple-50/50 to-teal-50"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-16 lg:min-h-[760px] lg:grid-cols-2 lg:px-8">
          <div>
            <p className="font-bold uppercase tracking-[0.28em] text-purple-500">
              Salud pélvica, vida sin límites
            </p>

            <h1 className="mt-5 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              <span className="block text-teal-600">FISIOTERAPIA</span>
              <span className="mt-1 block text-purple-500">
                DE SUELO PÉLVICO
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-xl font-medium leading-8 text-slate-700 md:text-2xl">
              Recupera tu bienestar, confianza y calidad de vida desde la
              comodidad de tu hogar.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <a
                href="#agendar"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 px-7 py-4 font-semibold text-white shadow-lg shadow-teal-200 transition hover:-translate-y-1 hover:bg-teal-700"
              >
                <CalendarDays size={18} />
                Agenda tu evaluación
                <ChevronRight size={18} />
              </a>
            </div>

            <div className="mt-10 grid gap-4 text-sm text-slate-700 sm:grid-cols-3">
              <div className="flex flex-col items-start gap-2 sm:items-center sm:text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  <HomeIcon size={22} />
                </span>
                <span className="font-medium">Atención a domicilio</span>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-center sm:text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                  <ShieldCheck size={22} />
                </span>
                <span className="font-medium">Atención profesional</span>
              </div>

              <div className="flex flex-col items-start gap-2 sm:items-center sm:text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-700">
                  <Heart size={22} />
                </span>
                <span className="font-medium">Tratamiento personalizado</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-purple-200/40 blur-3xl" />
            <div className="absolute -bottom-10 right-0 h-52 w-52 rounded-full bg-teal-200/50 blur-3xl" />

            <div className="relative overflow-hidden rounded-[3rem] bg-white p-3 shadow-2xl shadow-slate-200">
              <Image
                src="/milagros-hero.jpg"
                alt="Milagros Caicedo"
                width={700}
                height={760}
                className="h-[500px] w-full rounded-[2.5rem] object-cover lg:h-[600px]"
                priority
              />

              <div className="absolute left-7 top-8 max-w-[70%] rounded-3xl bg-white/88 px-5 py-4 shadow-lg backdrop-blur">
                <p className="text-xl font-semibold italic leading-7 text-purple-500 md:text-2xl">
                  “Tu salud pélvica también importa ♡”
                </p>
              </div>

              <div className="absolute bottom-7 left-7 right-7 rounded-3xl bg-white/92 p-5 shadow-xl backdrop-blur">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-2xl font-bold italic text-purple-500">
                      Milagros Caicedo
                    </p>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-teal-600 md:text-sm">
                      Fisioterapeuta especialista en suelo pélvico
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <ShieldCheck size={20} className="shrink-0 text-teal-600" />
                    <span>Atención profesional, cercana y en tu hogar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="scroll-mt-28 px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 text-center">
            <p className="font-bold uppercase tracking-[0.3em] text-purple-500">
              Cuidado especializado
            </p>
            <h2 className="mt-3 text-4xl font-black text-teal-700 md:text-5xl">
              Te ayudo con
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {servicios.map((item) => (
              <article
                key={item.title}
                className="group rounded-3xl border border-slate-100 bg-white p-7 shadow-lg shadow-slate-100 transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="mb-5 inline-flex rounded-2xl bg-purple-50 p-3 text-purple-500 transition group-hover:bg-purple-100">
                  <Sparkles size={28} />
                </div>

                <h3 className="text-lg font-bold uppercase text-teal-700">
                  {item.title}
                </h3>

                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {item.text}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* TU ATENCIÓN, PASO A PASO */}
      <section
        id="beneficios"
        className="scroll-mt-28 bg-gradient-to-br from-teal-50 to-purple-50 px-6 py-24"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="font-bold uppercase tracking-[0.25em] text-purple-500">
              Así funciona FISIOLU
            </p>

            <h2 className="mt-3 text-4xl font-black text-teal-700 md:text-5xl">
              Tu atención, paso a paso
            </h2>

            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Un proceso personalizado desde la primera evaluación hasta tus
              sesiones de tratamiento.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[2.5rem] bg-white p-9 shadow-xl shadow-slate-200/40">
              <h3 className="text-3xl font-bold text-teal-700">
                Tu primera atención ♡
              </h3>

              <div className="mt-7 space-y-6">
                {[
                  [
                    "1",
                    "Evaluación en tu domicilio",
                    "Milagros evalúa tu caso, tus síntomas y lo que necesitas.",
                  ],
                  [
                    "2",
                    "Plan personalizado",
                    "Se define el tratamiento más adecuado y la frecuencia recomendada.",
                  ],
                  [
                    "3",
                    "Comienza tu recuperación",
                    "Si necesitas tratamiento, puedes continuar con sesiones de 1 hora.",
                  ],
                ].map(([number, title, text]) => (
                  <div key={number} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700">
                      {number}
                    </span>

                    <div>
                      <p className="font-bold text-slate-800">{title}</p>
                      <p className="mt-1 leading-7 text-slate-600">{text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-2xl bg-teal-50 px-5 py-4 text-center font-bold text-teal-700">
                Evaluación inicial a domicilio · S/120
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-white p-9 shadow-xl shadow-slate-200/40">
              <h3 className="text-3xl font-bold text-teal-700">
                ¿Por qué FISIOLU?
              </h3>

              <ul className="mt-7 space-y-4">
                {[
                  "Especialización en suelo pélvico",
                  "Atención femenina y masculina",
                  "Embarazo y recuperación postparto",
                  "Abordaje de condiciones neurológicas",
                  "Atención privada en tu domicilio",
                  "Tratamiento adaptado a cada paciente",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="rounded-full bg-purple-100 p-1 text-purple-700">
                      <Check size={15} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8 rounded-2xl bg-purple-50 px-5 py-4 text-center font-bold text-purple-700">
                Sesiones de tratamiento · 1 hora · S/170
              </div>
            </div>
          </div>
        </div>
      </section>

     {/* SOBRE MÍ */}
<section
  id="sobre-mi"
  className="scroll-mt-28 px-6 py-24"
>
  <div className="mx-auto max-w-6xl">

    {/* ENCABEZADO */}
    <div className="mb-10 text-center">
      <p className="font-bold uppercase tracking-[0.25em] text-teal-600">
        Sobre mí ♡
      </p>

      <h2 className="mt-3 text-4xl font-black italic text-purple-500 md:text-5xl">
        Milagros Caicedo
      </h2>

      <p className="mt-3 font-bold uppercase text-teal-700">
        Fisioterapeuta especialista en suelo pélvico
      </p>

      <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
        Conoce mi formación, experiencia y la manera en que acompaño a cada
        paciente durante su proceso de recuperación.
      </p>
    </div>

    {/* VIDEO DE PRESENTACIÓN */}
    <div className="mx-auto max-w-4xl">
      <div className="relative aspect-video overflow-hidden rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-purple-50 to-teal-50 shadow-2xl shadow-slate-200/60">

        {/* PLACEHOLDER HASTA TENER EL VIDEO */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">

          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-600 text-white shadow-xl shadow-teal-200">
            <span className="ml-1 text-3xl">▶</span>
          </div>

          <h3 className="mt-6 text-2xl font-bold text-slate-800">
            Video de presentación
          </h3>

          <p className="mt-3 max-w-xl leading-7 text-slate-600">
            Milagros te contará sobre su formación, especialización, experiencia
            y la forma en que trabaja en FISIOLU.
          </p>

          <p className="mt-4 text-sm font-semibold text-purple-500">
            Próximamente
          </p>

        </div>
      </div>
    </div>

  </div>
</section>

      {/* TESTIMONIOS */}
      <section
        id="testimonios"
        className="scroll-mt-28 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-purple-50 px-6 py-24"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <p className="font-bold uppercase tracking-[0.25em] text-purple-500">
              Experiencias
            </p>

            <h2 className="mt-3 text-4xl font-black text-teal-700 md:text-5xl">
              Lo que dicen mis pacientes
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              Historias de personas que han mejorado su bienestar y calidad de vida
              con FISIOLU.
            </p>
          </div>

          <div className="relative">
            <div className="testimonial-track flex w-max gap-6">
              {[
                {
                  name: "Camila R.",
                  area: "Incontinencia urinaria",
                  text: "Milagros me ayudó a mejorar muchísimo la incontinencia urinaria. Hoy me siento con más seguridad y confianza en mi vida diaria.",
                },
                {
                  name: "Valentina M.",
                  area: "Dolor pélvico",
                  text: "Llegué con dolor pélvico y desde las primeras sesiones sentí alivio. La atención en casa hizo todo mucho más cómodo.",
                },
                {
                  name: "Daniela T.",
                  area: "Recuperación postparto",
                  text: "Después del parto me ayudó a recuperar fuerza y control del suelo pélvico. Me sentí acompañada durante todo el proceso.",
                },
                {
                  name: "Andrea S.",
                  area: "Dispareunia",
                  text: "Las sesiones me ayudaron muchísimo con el dolor durante las relaciones. Todo fue explicado con mucha claridad y respeto.",
                },
                {
                  name: "María P.",
                  area: "Vejiga hiperactiva",
                  text: "Tenía urgencia urinaria y ahora puedo hacer mis actividades con mucha más tranquilidad. Estoy muy agradecida.",
                },
                {
                  name: "Lucía G.",
                  area: "Prolapso",
                  text: "Aprendí a entender mejor mi cuerpo y a manejar los síntomas del prolapso con ejercicios adaptados a mi caso.",
                },
                {
                  name: "Fernanda C.",
                  area: "Dolor de coxis",
                  text: "Tenía dolor al sentarme durante meses. Con el tratamiento fui mejorando y recuperé mucha comodidad en mi día a día.",
                },
                {
                  name: "Paola V.",
                  area: "Hipertonía del suelo pélvico",
                  text: "Me ayudó a relajar y controlar mejor el suelo pélvico. La atención fue cercana, profesional y muy personalizada.",
                },
                {
                  name: "Sofía L.",
                  area: "Recuperación de cesárea",
                  text: "Me orientó con mi recuperación y la cicatriz de cesárea. Sentí mucha confianza desde la primera evaluación.",
                },
                {
                  name: "Carolina N.",
                  area: "Dolor lumbopélvico",
                  text: "El tratamiento fue muy completo. Mejoré el dolor y entendí cómo trabajar mejor mi postura y mi zona pélvica.",
                },
                {
                  name: "Camila R.",
                  area: "Incontinencia urinaria",
                  text: "Milagros me ayudó a mejorar muchísimo la incontinencia urinaria. Hoy me siento con más seguridad y confianza en mi vida diaria.",
                },
                {
                  name: "Valentina M.",
                  area: "Dolor pélvico",
                  text: "Llegué con dolor pélvico y desde las primeras sesiones sentí alivio. La atención en casa hizo todo mucho más cómodo.",
                },
                {
                  name: "Daniela T.",
                  area: "Recuperación postparto",
                  text: "Después del parto me ayudó a recuperar fuerza y control del suelo pélvico. Me sentí acompañada durante todo el proceso.",
                },
                {
                  name: "Andrea S.",
                  area: "Dispareunia",
                  text: "Las sesiones me ayudaron muchísimo con el dolor durante las relaciones. Todo fue explicado con mucha claridad y respeto.",
                },
                {
                  name: "María P.",
                  area: "Vejiga hiperactiva",
                  text: "Tenía urgencia urinaria y ahora puedo hacer mis actividades con mucha más tranquilidad. Estoy muy agradecida.",
                },
                {
                  name: "Lucía G.",
                  area: "Prolapso",
                  text: "Aprendí a entender mejor mi cuerpo y a manejar los síntomas del prolapso con ejercicios adaptados a mi caso.",
                },
                {
                  name: "Fernanda C.",
                  area: "Dolor de coxis",
                  text: "Tenía dolor al sentarme durante meses. Con el tratamiento fui mejorando y recuperé mucha comodidad en mi día a día.",
                },
                {
                  name: "Paola V.",
                  area: "Hipertonía del suelo pélvico",
                  text: "Me ayudó a relajar y controlar mejor el suelo pélvico. La atención fue cercana, profesional y muy personalizada.",
                },
                {
                  name: "Sofía L.",
                  area: "Recuperación de cesárea",
                  text: "Me orientó con mi recuperación y la cicatriz de cesárea. Sentí mucha confianza desde la primera evaluación.",
                },
                {
                  name: "Carolina N.",
                  area: "Dolor lumbopélvico",
                  text: "El tratamiento fue muy completo. Mejoré el dolor y entendí cómo trabajar mejor mi postura y mi zona pélvica.",
                },
              ].map((item, index) => (
                <article
                  key={`${item.name}-${index}`}
                  className="w-[320px] shrink-0 rounded-[2rem] border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/50"
                >
                  <div className="flex gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={18} fill="currentColor" />
                    ))}
                  </div>

                  <p className="mt-5 min-h-[150px] leading-7 text-slate-600">
                    “{item.text}”
                  </p>

                  <div className="mt-6 border-t border-slate-100 pt-5">
                    <p className="font-bold text-teal-700">{item.name}</p>
                    <p className="mt-1 text-sm font-medium text-purple-500">
                      {item.area}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-slate-400">
            Los testimonios se desplazan automáticamente.
          </p>
        </div>

        <style jsx>{`
          .testimonial-track {
            animation: testimonial-scroll 55s linear infinite;
          }

          .testimonial-track:hover {
            animation-play-state: paused;
          }

          @keyframes testimonial-scroll {
            from {
              transform: translateX(0);
            }

            to {
              transform: translateX(calc(-50% - 12px));
            }
          }

          @media (max-width: 768px) {
            .testimonial-track {
              animation-duration: 70s;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .testimonial-track {
              animation: none;
            }
          }
        `}</style>
      </section>

      {/* CONTACTO */}
      {/* AGENDAR CITA */}
      <section
        id="agendar"
        className="scroll-mt-44 bg-white px-6 py-24"
      >
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="font-bold uppercase tracking-[0.25em] text-purple-500">
              Agenda tu evaluación
            </p>

            <h2 className="mt-3 text-4xl font-black text-teal-700 md:text-5xl">
              Primero evaluamos qué necesitas
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Si es tu primera atención, agenda una evaluación inicial a domicilio
              por S/120. Después de evaluarte, Milagros podrá indicarte el
              tratamiento, la frecuencia y la cantidad de sesiones más adecuada
              para ti.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3 text-sm">
              <span className="rounded-full bg-teal-50 px-4 py-2 font-semibold text-teal-700">
                Evaluación inicial · S/120
              </span>
              <span className="rounded-full bg-purple-50 px-4 py-2 font-semibold text-purple-700">
                Sesión · 1 hora · S/170
              </span>
              <span className="rounded-full bg-slate-100 px-4 py-2 font-semibold text-slate-700">
                Atención a domicilio
              </span>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-[2.5rem] border border-slate-100 bg-gradient-to-br from-white to-purple-50 p-7 shadow-2xl shadow-slate-200/50 md:p-10"
          >
            <div className="mb-8">
              <p className="mb-3 text-center font-bold text-slate-800">
                ¿Es tu primera atención con FISIOLU?
              </p>

              <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
                <label
                  className={`cursor-pointer rounded-2xl border p-5 transition ${
                    form.tipoPaciente === "Primera atención - Evaluación S/120"
                      ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100"
                      : "border-slate-200 bg-white hover:border-teal-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="tipoPaciente"
                      value="Primera atención - Evaluación S/120"
                      checked={
                        form.tipoPaciente === "Primera atención - Evaluación S/120"
                      }
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />

                    <div>
                      <span className="font-bold text-slate-900">
                        Primera atención
                      </span>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Evaluación inicial a domicilio · S/120
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`cursor-pointer rounded-2xl border p-5 transition ${
                    form.tipoPaciente === "Paciente en tratamiento - Sesión S/170"
                      ? "border-purple-500 bg-purple-50 ring-2 ring-purple-100"
                      : "border-slate-200 bg-white hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="tipoPaciente"
                      value="Paciente en tratamiento - Sesión S/170"
                      checked={
                        form.tipoPaciente === "Paciente en tratamiento - Sesión S/170"
                      }
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />

                    <div>
                      <span className="font-bold text-slate-900">
                        Ya soy paciente
                      </span>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Sesión de tratamiento · 1 hora · S/170
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="mb-8">
              <p className="mb-3 text-center font-bold text-slate-800">
                ¿Qué tipo de atención necesitas?
              </p>

              <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  ["General", "Suelo pélvico general"],
                  ["Femenina", "Femenino"],
                  ["Masculina", "Masculino"],
                  ["Embarazo", "Embarazo"],
                  ["Neurologica", "Neurológico"],
                ].map(([value, label]) => (
                  <label
                    key={value}
                    className={`cursor-pointer rounded-2xl border p-5 transition ${
                      form.area === value
                        ? "border-teal-500 bg-teal-50 ring-2 ring-teal-100"
                        : "border-slate-200 bg-white hover:border-teal-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="area"
                        value={value}
                        checked={form.area === value}
                        onChange={handleChange}
                        required
                      />
                      <span className="font-bold text-slate-900">{label}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="nombre"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Nombre y apellido
                </label>

                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  value={form.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre y apellido"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div>
                <label
                  htmlFor="telefono"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  WhatsApp
                </label>

                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  required
                  value={form.telefono}
                  onChange={handleChange}
                  placeholder="Tu número de WhatsApp"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div>
  <label className="mb-2 block text-sm font-semibold text-slate-700">
    Distrito / Zona
  </label>

  <div className="relative">
    <select
      name="distrito"
      required
      value={form.distrito}
      onChange={handleChange}
      className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-4 pr-12 text-slate-700 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
    >
      <option value="" disabled>
        Selecciona tu distrito
      </option>

      <option value="San Juan de Miraflores">
        San Juan de Miraflores
      </option>

      <option value="Chorrillos">Chorrillos</option>
      <option value="Barranco">Barranco</option>
      <option value="Miraflores">Miraflores</option>
      <option value="Surco">Surco</option>
      <option value="Surquillo">Surquillo</option>
      <option value="San Borja">San Borja</option>
      <option value="San Luis">San Luis</option>
    </select>

    <ChevronDown
      size={20}
      className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
    />
  </div>

  <p className="mt-2 text-sm text-slate-500">
    Atención a domicilio disponible únicamente en estos distritos.
  </p>
</div>

              <div>
                <label
                  htmlFor="direccion"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Dirección
                </label>

                <input
                  id="direccion"
                  name="direccion"
                  type="text"
                  required
                  value={form.direccion}
                  onChange={handleChange}
                  placeholder="Dirección donde deseas recibir la atención"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </div>
              {form.area === "Embarazo" && (
                <div className="md:col-span-2">
                  <label
                    htmlFor="semanas"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    ¿Cuántas semanas de embarazo tienes?
                  </label>

                  <input
                    id="semanas"
                    name="semanas"
                    type="number"
                    min="1"
                    max="42"
                    required
                    value={form.semanas}
                    onChange={handleChange}
                    placeholder="Ej. 28"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  />
                </div>
              )}

              {form.tipoPaciente && form.area && (
                <div className="md:col-span-2">
                  <label
                    htmlFor="motivo"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    {form.tipoPaciente === "Primera atención - Evaluación S/120"
                      ? "Motivo de la evaluación"
                      : "Motivo de la sesión"}
                  </label>

                  <div className="relative">
                    <select
                      id="motivo"
                      name="motivo"
                      required
                      value={form.motivo}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-14 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                    >
                      <option value="">
                        {form.tipoPaciente === "Primera atención - Evaluación S/120"
                          ? "Selecciona el motivo de tu evaluación"
                          : "Selecciona el motivo de tu sesión"}
                      </option>

                      {(motivosPorArea[form.area] ?? []).map((motivo) => (
                        <option key={motivo} value={motivo}>
                          {motivo}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={18}
                      className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-700"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  htmlFor="fecha"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Fecha preferida
                </label>

                <input
                  id="fecha"
                  name="fecha"
                  type="date"
                  required
                  value={form.fecha}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div>
                <label
                  htmlFor="hora"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Hora preferida
                </label>

                <div className="relative">
                  <select
                    id="hora"
                    name="hora"
                    required
                    value={form.hora}
                    onChange={handleChange}
                    disabled={!form.fecha || loadingSlots}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-14 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                  >
                    {!form.fecha && (
                      <option value="">Primero selecciona una fecha</option>
                    )}

                    {form.fecha && loadingSlots && (
                      <option value="">Consultando horarios...</option>
                    )}

                    {form.fecha && !loadingSlots && availabilityError && (
                      <option value="">No se pudieron cargar los horarios</option>
                    )}

                    {form.fecha &&
                      !loadingSlots &&
                      !availabilityError &&
                      availableSlots.length === 0 && (
                        <option value="">No hay horarios disponibles</option>
                      )}

                    {form.fecha &&
                      !loadingSlots &&
                      !availabilityError &&
                      availableSlots.length > 0 && (
                        <>
                          <option value="">Selecciona una hora disponible</option>
                          {availableSlots.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </>
                      )}
                  </select>

                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-slate-700"
                  />
                </div>

                {availabilityError && (
                  <p className="mt-2 text-xs font-medium text-red-500">
                    {availabilityError}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="mensaje"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Mensaje adicional
                </label>

                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={4}
                  value={form.mensaje}
                  onChange={handleChange}
                  placeholder="Cuéntale brevemente a Milagros qué necesitas..."
                  className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-7 py-4 font-bold text-white shadow-lg shadow-teal-200 transition hover:-translate-y-1 hover:bg-teal-700"
            >
              <MessageCircle size={20} />
              Enviar solicitud por WhatsApp
            </button>

            <div className="mt-5 grid gap-3 text-center text-xs leading-5 text-slate-500 sm:grid-cols-2">
              <p>
                La solicitud no confirma automáticamente el horario. Milagros
                revisará la disponibilidad y te responderá por WhatsApp.
              </p>
              <p>
                La cantidad y frecuencia de sesiones se define de forma
                personalizada después de la evaluación inicial.
              </p>
            </div>
          </form>
        </div>
      </section>
      <section
        id="contacto"
        className="bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-20 text-white"
      >
        <div className="mx-auto max-w-5xl text-center">
          <Heart className="mx-auto mb-5" size={34} />

          <p className="text-lg italic text-teal-50">
            Estoy para acompañarte en este hermoso viaje
          </p>

          <h2 className="mt-3 text-4xl font-black md:text-5xl">
            ¿Tienes una pregunta?
          </h2>

          <p className="mt-5 text-4xl font-bold md:text-5xl">
            972172046
          </p>

          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-9 py-4 font-bold text-teal-700 transition hover:scale-105"
          >
            <MessageCircle size={20} />
            Escríbeme por WhatsApp
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 py-8 text-center text-sm text-slate-500">
        © 2026 FISIOLU · Fisioterapia Suelo Pélvico
      </footer>

      {/* REDES SOCIALES FLOTANTES */}
      <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3 sm:right-6">
        <div className="mb-1 hidden items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-4 py-2 text-xs font-bold text-slate-600 shadow-lg backdrop-blur sm:flex">
          <Share2 size={15} className="text-purple-500" />
          Síguenos
        </div>

        <a
          href="https://www.instagram.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram de FISIOLU"
          className="group flex items-center justify-end"
        >
          <span className="mr-2 hidden translate-x-3 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
            Instagram
          </span>

          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white shadow-xl transition duration-300 group-hover:-translate-y-1 group-hover:scale-110">
            <svg
              viewBox="0 0 24 24"
              className="h-[22px] w-[22px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="5" />
              <circle cx="12" cy="12" r="4" />
              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </svg>
          </span>
        </a>

        <a
          href="https://www.facebook.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook de FISIOLU"
          className="group flex items-center justify-end"
        >
          <span className="mr-2 hidden translate-x-3 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
            Facebook
          </span>

          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition duration-300 group-hover:-translate-y-1 group-hover:scale-110">
            <span className="text-2xl font-black leading-none">f</span>
          </span>
        </a>

        <a
          href="https://www.youtube.com/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="YouTube de FISIOLU"
          className="group flex items-center justify-end"
        >
          <span className="mr-2 hidden translate-x-3 rounded-full bg-white px-3 py-2 text-sm font-bold text-slate-700 opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 sm:block">
            YouTube
          </span>

          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl transition duration-300 group-hover:-translate-y-1 group-hover:scale-110">
            <svg
              viewBox="0 0 24 24"
              className="h-[23px] w-[23px]"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M23 12s0-3.6-.46-5.33a2.96 2.96 0 0 0-2.08-2.09C18.73 4.12 12 4.12 12 4.12s-6.73 0-8.46.46a2.96 2.96 0 0 0-2.08 2.09C1 8.4 1 12 1 12s0 3.6.46 5.33a2.96 2.96 0 0 0 2.08 2.09c1.73.46 8.46.46 8.46.46s6.73 0 8.46-.46a2.96 2.96 0 0 0 2.08-2.09C23 15.6 23 12 23 12Z" />
              <path d="m10 15.5 5.2-3.5L10 8.5v7Z" fill="white" />
            </svg>
          </span>
        </a>
      </div>
    </main>
  );
}