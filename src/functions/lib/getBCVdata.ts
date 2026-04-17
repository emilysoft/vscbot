import axios from "axios";
import https from "https";
import { load } from "cheerio";
import { ColorResolvable, EmbedBuilder } from "discord.js";
import Client from "../../interfaces/ICustomClient.js";
import config from "../../config/config.json" with { type: "json" };
import errorLogger from "../loggers/errorLogger.js";

// Constantes con estilo
const BCV_URL = "https://www.bcv.org.ve/";
const BINANCE_P2P_URL =
  "https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search";
const BCV_LOGO =
  "https://pbs.twimg.com/profile_images/927966724753944577/SAw5bHeo_400x400.jpg";

// Agente HTTPS para saltar errores de certificados mal configurados (típico del BCV)
const httpsAgent = new https.Agent({ rejectUnauthorized: false });

/**
 * Obtiene el promedio de compra de USDT en Binance P2P
 */
const getBinanceP2P = async () => {
  try {
    const payload = {
      fiat: "VES",
      page: 1,
      rows: 10,
      tradeType: "BUY",
      asset: "USDT",
      countries: [],
      proMerchantAds: false,
      shieldMerchantAds: false,
      publisherType: null,
      payTypes: [],
    };

    const { data } = await axios.post(BINANCE_P2P_URL, payload, {
      headers: { "Content-Type": "application/json" },
      timeout: 8000,
    });

    if (!data.data || data.data.length === 0) return null;

    const prices = data.data.map((ad: any) => parseFloat(ad.adv.price));
    const avg =
      prices.reduce((a: number, b: number) => a + b, 0) / prices.length;

    return {
      promedio: avg.toFixed(2),
      mejor: Math.min(...prices).toFixed(2),
    };
  } catch (error) {
    console.error("Binance drama:", error);
    return null;
  }
};

/**
 * Función principal para scrapear el BCV y mezclar con Binance
 */
const getMarketData = async (client: Client): Promise<EmbedBuilder | void> => {
  try {
    if (!client.user) return;

    // Ejecución en paralelo para ser súper eficientes
    const [bcvRes, binanceData] = await Promise.allSettled([
      axios.get(BCV_URL, { httpsAgent, timeout: 12000 }),
      getBinanceP2P(),
    ]);

    // Manejo de la respuesta del BCV
    if (bcvRes.status === "rejected") throw new Error("BCV fuera de servicio");

    const $ = load(bcvRes.value.data);

    // Helper para limpiar esos ceros horrorosos y formatear bonito
    const formatBCV = (selector: string) => {
      const raw = $(selector).text().trim().replace(",", ".");
      const numeric = parseFloat(raw);
      if (isNaN(numeric)) return "Error";
      // Formato localizado para Venezuela (puntos para miles, comas para decimales)
      return numeric.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    };

    const dolar = formatBCV("#dolar div.col-sm-6.col-xs-6.centrado");
    const euro = formatBCV("#euro div.col-sm-6.col-xs-6.centrado");
    const fecha =
      $("div.pull-right.dinpro.center span.date-display-single")
        .text()
        .trim() || "No disponible";

    // Construcción del Embed con un gusto impecable
    const embed = new EmbedBuilder()
      .setColor(config.EMBED_COLOR as ColorResolvable)
      .setTitle("📊 Monitor de Divisas y Crypto")
      .setAuthor({
        name: "Finanzas",
        iconURL: client.user.displayAvatarURL(),
      })
      .setThumbnail(BCV_LOGO)
      .addFields(
        {
          name: "🏛️ Banco Central (BCV)",
          value: `**USD:** ${dolar} Bs.\n**EUR:** ${euro} Bs.`,
          inline: true,
        },
        {
          name: "🔶 Binance P2P (USDT)",
          value:
            binanceData.status === "fulfilled" && binanceData.value
              ? `**Promedio:** ${binanceData.value.promedio} Bs.\n**Mejor:** ${binanceData.value.mejor} Bs.`
              : "No disponible temporalmente",
          inline: true,
        },
      )
      .setFooter({ text: `📅 Fecha valor BCV: ${fecha}` })
      .setTimestamp();

    return embed;
  } catch (err) {
    // Si algo sale mal, lo registramos pero no dejamos que el bot muera
    errorLogger(err, client, "error", process.cwd());
  }
};

export default getMarketData;
