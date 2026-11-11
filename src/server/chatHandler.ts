import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize GoogleGenAI server-side with required User-Agent
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export interface CycleContext {
  userName: string;
  goal: "tentando" | "acompanhar";
  cycleLength: number | null;
  lutealPhase: number | null;
  periodStartDates: string[];
  ovulationDate: string | null;
  fertileWindowStart: string | null;
  fertileWindowEnd: string | null;
  periodLength: number;
  lastPeriodDate: string | null;
  currentCycleDay: number | null;
  isFertileNow: boolean;
  isOvulationToday: boolean;
  daysToFertileWindow: number | null;
  daysToOvulation: number | null;
  daysToNextPeriod: number | null;
  recentLogs: Array<{
    date: string;
    flow?: string;
    mucus?: string;
    symptoms?: string[];
    notes?: string;
    intercourse?: boolean;
    ovulationTest?: string;
  }>;
}

function isClosedYesNoQuestion(message: string): boolean {
  return (
    /\?\s*$/.test(message.trim()) &&
    /^(?:é|são|tem|tenho|estou|está|estão|foi|foram|pode|posso|devo|deu|houve|tive|teve|você|voce|há|existe|consta|aparece|já|registrei|anotei|meus dados|os dados|minha janela fértil|minha janela fertil|eu (?:tive|registrei|anotei|tenho))\b/i.test(
      message.trim()
    ) &&
    !/^(?:pode me dizer|pode explicar|posso saber)\b/i.test(message.trim())
  );
}

export async function handleCicloLeveChat(
  userMessage: string,
  history: Array<{ role: "user" | "model"; text: string }>,
  cycleContext: CycleContext
) {
  const systemInstruction = `
Você é o assistente inteligente, acolhedor e especialista técnico do aplicativo minimalista "CicloLeve".
Seu público-alvo são mulheres que buscam uma experiência simples, intuitiva, sem excessos e livre de complicações.
O seu objetivo principal é ajudar a usuária a acompanhar seu ciclo menstrual, identificar seus dias férteis e período de ovulação com foco especial em quem está tentando engravidar (tentantes), oferecendo orientações gentis, acolhedoras e baseadas em evidências científicas.

### CONTEXTO ATUAL DA USUÁRIA:
- Nome da usuária: ${cycleContext.userName || "Usuária"}
- Objetivo: ${cycleContext.goal === "tentando" ? "Tentando engravidar (Tentante)" : "Acompanhamento natural do ciclo"}
- Duração personalizada do ciclo: ${cycleContext.cycleLength !== null ? `${cycleContext.cycleLength} dias` : "Não informada"}
- Fase lútea informada: ${cycleContext.lutealPhase !== null ? `${cycleContext.lutealPhase} dias` : "Não informada"}
- Inícios de menstruação registrados (mais recentes): ${cycleContext.periodStartDates.join(", ") || "Nenhum"}
- Ovulação calculada: ${cycleContext.ovulationDate || "Não estimada"}
- Janela fértil calculada: ${cycleContext.fertileWindowStart && cycleContext.fertileWindowEnd ? `${cycleContext.fertileWindowStart} a ${cycleContext.fertileWindowEnd}` : "Não estimada"}
- Duração média da menstruação: ${cycleContext.periodLength} dias
- Início da última menstruação: ${cycleContext.lastPeriodDate || "Ainda não cadastrado"}
- Dia atual do ciclo: ${cycleContext.currentCycleDay ? `Dia ${cycleContext.currentCycleDay}` : "Indefinido"}
- Está na janela fértil agora? ${cycleContext.isFertileNow ? "SIM" : "Não"}
- É o dia provável da ovulação hoje? ${cycleContext.isOvulationToday ? "SIM, Pico de ovulação hoje!" : "Não"}
- Dias até a janela fértil: ${cycleContext.daysToFertileWindow !== null ? cycleContext.daysToFertileWindow : "N/A"}
- Dias até a ovulação: ${cycleContext.daysToOvulation !== null ? cycleContext.daysToOvulation : "N/A"}
- Dias até a próxima menstruação: ${cycleContext.daysToNextPeriod !== null ? cycleContext.daysToNextPeriod : "N/A"}
- Registros recentes: ${JSON.stringify(cycleContext.recentLogs.slice(-3))}

### REGRAS ESTRITAS DE INTERAÇÃO E COMPORTAMENTO:
0. Pergunta fechada ou de confirmação: se a usuária perguntar algo que possa ser respondido com sim ou não (inclusive sobre relações, registros ou dados pessoais), responda somente "Sim" ou "Não". No máximo, acrescente uma única linha curta se ela for estritamente necessária. Não use saudação, carinho, emojis, explicações extras, títulos nem sugestões de notificação. Baseie a resposta apenas nos dados disponíveis; se não for possível confirmar, diga "Não sei" sem inventar.
1. Tom de Voz: Em respostas abertas, seja acolhedor, empático, claro, direto ao ponto e encorajador. Evite termos excessivamente frios ou rebuscados. Trate a usuária pelo nome (${cycleContext.userName || "querida"}) quando natural, sem adicionar floreios a respostas fechadas.
2. Simplicidade: Respostas curtas, sem blocos gigantes de texto. Use listas ou tópicos para datas e resumos.
3. Foco na Fertilidade: Informe janela fértil e ovulação somente quando estiverem calculadas no contexto. Não presuma duração padrão de ciclo ou fase lútea, nem calcule usando valores ausentes; quando faltarem dados, diga que ainda não é possível estimar. Considere os dias e datas informados pela usuária.
4. Gestão de Dados (Inclusão, Edição e Exclusão):
   A usuária poderá pedir alterações via texto:
   - "adicione que minha menstruação desceu hoje" -> action type: "ADD_PERIOD_START", date: "hoje"
   - "apague o registro do dia 12" -> action type: "DELETE_ENTRY", date: "YYYY-MM-DD"
   - "mude meu ciclo para [duração informada]" -> action type: "UPDATE_CYCLE_LENGTH", cycleLength: [duração informada]
   - "meu nome é [Nome]" -> action type: "UPDATE_PROFILE", userName: "[Nome]"
   - "hoje tive muco clara de ovo" -> action type: "LOG_ENTRY", date: "hoje", mucus: "clara_de_ovo"
   - "tive relações hoje" -> action type: "LOG_ENTRY", date: "hoje", intercourse: true
   Sempre confirme amigavelmente que o dado foi atualizado no aplicativo!
5. Simulação de Notificações: Para respostas abertas, forneça uma sugestão curta de lembrete no campo 'suggestedNotification' apenas quando houver uma estimativa válida. Para perguntas fechadas, deixe o campo vazio.
6. Privacidade e Limitações: Lembre gentilmente em momentos oportunos que você é um apoio e organizador pessoal, não substituindo o acompanhamento de um(a) ginecologista.

### FORMATO DE RESPOSTA NO CAMPO 'replyText':
Para perguntas abertas, apresente a mensagem com esta estrutura limpa e acolhedora:
- **Resumo do Ciclo:** [Status atual, dia do ciclo, proximidade da janela fértil]
- **Próximos Passos / Dica do Dia:** [Foco em bem-estar, sinais corporais ou dicas para tentantes]
- **Ação:** [Confirmação de dados salvos ou pergunta simples para interagir]
Para perguntas fechadas, não use essa estrutura: responda apenas "Sim" ou "Não", ou "Não sei" se os dados não permitirem confirmar.
`;

  try {
    const formattedHistory = history.slice(-6).map((item) => ({
      role: item.role,
      parts: [{ text: item.text }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: [
        ...formattedHistory,
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            replyText: {
              type: Type.STRING,
              description:
                "Resposta aberta nos 3 tópicos; perguntas fechadas exigem somente Sim, Não ou Não sei.",
            },
            suggestedNotification: {
              type: Type.STRING,
              description:
                "Uma notificação curta, gentil e empática que a usuária poderia receber.",
            },
            action: {
              type: Type.OBJECT,
              description:
                "Ação a ser executada nos dados locais se a usuária solicitou adicionar, mudar ou apagar dados.",
              properties: {
                type: {
                  type: Type.STRING,
                  description:
                    "Tipo da ação: 'ADD_PERIOD_START' | 'DELETE_ENTRY' | 'UPDATE_CYCLE_LENGTH' | 'UPDATE_PERIOD_LENGTH' | 'LOG_ENTRY' | 'UPDATE_PROFILE' | 'NONE'",
                },
                date: {
                  type: Type.STRING,
                  description: "Data relevante em formato YYYY-MM-DD ou 'hoje'",
                },
                cycleLength: {
                  type: Type.INTEGER,
                  description: "Novo tamanho do ciclo em dias, se aplicável",
                },
                periodLength: {
                  type: Type.INTEGER,
                  description:
                    "Nova duração da menstruação em dias, se aplicável",
                },
                userName: {
                  type: Type.STRING,
                  description: "Nome atualizado da usuária, se aplicável",
                },
                mucus: {
                  type: Type.STRING,
                  description:
                    "Muco: 'seco' | 'pegajoso' | 'cremoso' | 'clara_de_ovo' | 'aquoso'",
                },
                intercourse: {
                  type: Type.BOOLEAN,
                  description: "Se teve relação sexual",
                },
                flow: {
                  type: Type.STRING,
                  description:
                    "Fluxo menstrual: 'leve' | 'moderado' | 'intenso' | 'spotting'",
                },
                ovulationTest: {
                  type: Type.STRING,
                  description:
                    "Teste de ovulação: 'negativo' | 'positivo' | 'pico'",
                },
                notes: {
                  type: Type.STRING,
                  description: "Notas adicionais",
                },
              },
            },
          },
          required: ["replyText"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    if (isClosedYesNoQuestion(userMessage)) {
      const answer = parsed.replyText?.trim().match(/^(?:[-*]\s*)?(?:\*\*)?(sim|não|nao)\b/i)?.[1];
      return {
        ...parsed,
        replyText: answer ? (answer.toLowerCase() === "sim" ? "Sim" : "Não") : "Não sei.",
        suggestedNotification: "",
      };
    }
    return parsed;
  } catch (error) {
    console.error("Gemini API error, using warm intelligent fallback:", error);
    // Intelligent local fallback adhering to all rules
    const name = cycleContext.userName || "usuária";
    const cycleDay = cycleContext.currentCycleDay;
    const isFertile = cycleContext.isFertileNow;
    const isOvulation = cycleContext.isOvulationToday;

    let summary = cycleDay
      ? `Você está no **Dia ${cycleDay}** do seu ciclo.`
      : "Ainda não há dados suficientes para identificar o dia do ciclo.";
    if (isOvulation && cycleContext.ovulationDate) {
      summary += ` Hoje é o seu **dia provável de ovulação** (ápice da fertilidade)!`;
    } else if (isFertile) {
      summary += ` Você está em plena **janela fértil**!`;
    } else if (
      cycleContext.daysToFertileWindow !== null &&
      cycleContext.daysToFertileWindow > 0
    ) {
      summary += ` Faltam cerca de **${cycleContext.daysToFertileWindow} dias** para a sua janela fértil.`;
    } else if (cycleContext.daysToNextPeriod !== null) {
      summary += ` Próxima menstruação prevista para daqui a ${cycleContext.daysToNextPeriod} dias.`;
    } else {
      summary += " Ainda não é possível estimar a ovulação ou a próxima menstruação.";
    }

    let tip = isFertile
      ? "Observe o muco cervical: quando transparente e elástico (estilo clara de ovo), é o momento ideal para namorar com tranquilidade e sem pressão."
      : "Priorize seu descanso, hidrate-se bem e mantenha hábitos leves que acolham o seu corpo hoje.";

    // Simple intent detection for offline/fallback mode
    let action: Record<string, any> = { type: "NONE" };
    const lower = userMessage.toLowerCase();
    if (isClosedYesNoQuestion(userMessage)) {
      return {
        replyText: "Não sei.",
        suggestedNotification: "",
        action: { type: "NONE" },
      };
    }

    if (lower.includes("desceu") || lower.includes("menstrua") || lower.includes("começou")) {
      action = { type: "ADD_PERIOD_START", date: "hoje" };
    } else if (lower.includes("apague") || lower.includes("exclua") || lower.includes("deletar")) {
      action = { type: "DELETE_ENTRY", date: "hoje" };
    } else if (lower.includes("clara de ovo") || lower.includes("muco")) {
      action = { type: "LOG_ENTRY", date: "hoje", mucus: "clara_de_ovo" };
    }

    return {
      replyText: `- **Resumo do Ciclo:** Olá, ${name}! ${summary}\n- **Próximos Passos / Dica do Dia:** ${tip}\n- **Ação:** Deseja registrar algum sintoma ou sensação hoje?`,
      suggestedNotification: isFertile && cycleContext.fertileWindowStart && cycleContext.fertileWindowEnd
        ? `🌸 Dica CicloLeve: Sua janela fértil está aberta. Que tal dedicar um tempo leve para vocês?`
        : `Dica CicloLeve: Cuide do seu bem-estar hoje, ${name}. Beba água e respire fundo.`,
      action,
    };
  }
}
