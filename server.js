const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();
const PORT = process.env.PORT || 3000;

// ================= MIDDLEWARES =================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ================= DADOS INICIAIS =================
const initialData = {
  versiculo: {
    texto: "Bendito seja o Deus e Pai de nosso Senhor Jesus Cristo, que, segundo a sua grande misericórdia, nos gerou de novo para uma viva esperança, pela ressurreição de Jesus Cristo dentre os mortos.",
    referencia: "1 Pedro 1:3"
  },
  palavraSemana: {
    titulo: "O FIM É MELHOR DO QUE O COMEÇO",
    mensagem: `1. O Fim Revela o Propósito\nIntrodução: "Melhor é o fim das coisas do que o princípio delas..." (Ec 7:8)\n\nExplicação: No início, ainda não entendemos o propósito completo daquilo que Deus está fazendo. O começo pode parecer confuso, difícil ou incerto. Mas o fim revela aquilo que Deus estava construindo silenciosamente.\n\nVersículo: "Sabemos que todas as coisas cooperam para o bem daqueles que amam a Deus..." (Rm 8:28)\n\nAplicação: Confie que Deus está trabalhando mesmo quando você não vê o resultado. Não julgue sua caminhada pelos primeiros capítulos—Deus está escrevendo o final.\n\n2. A Paciência Forja o Caráter\nTexto-base: "...melhor é o paciente de espírito do que o altivo de espírito." (Ec 7:8)\n\nIntrodução: Quem é paciente permite que Deus o molde durante o processo. O altivo quer resultados imediatos; o paciente amadurece enquanto espera.\n\nVersículo: "Mas tenha a paciência a sua obra perfeita, para que sejais perfeitos e completos..." (Tg 1:4)\n\nAplicação: Deixe que o processo transforme você. A demora não é castigo, é construção. A maturidade surge na espera.\n\n3. Deus Vê o Final Desde o Princípio\nExplicação: Deus não está limitado ao tempo. Ele conhece o final de cada história, e por isso podemos descansar mesmo no início, quando tudo parece incerto.\n\nVersículo: "Eu anuncio o fim desde o princípio..." (Is 46:10)\n\nAplicação: Descanso espiritual vem quando lembramos que Deus já viu sua vitória antes mesmo de você enfrentar a batalha. Ele sabe aonde quer te levar.\n\n4. O Final de Deus Sempre Supera o Começo Humano\nIntrodução: O fim que Deus prepara sempre é melhor do que o começo que nós mesmos planejamos. Ele transforma lágrimas em risos e desespero em esperança.\n\nVersículo: "O fim das coisas é melhor que o princípio delas." (Ec 7:8)\n"A glória desta última casa será maior do que a da primeira..." (Ag 2:9)\n\nConclusão: Creia que Deus pode terminar sua história melhor do que você começou. O que começa pequeno pode terminar glorioso nas mãos de Deus. Sua vida não será definida pelo seu início, mas pelo final que Deus prepara.`
  },
  agenda: [
    { tipo: "recorrente", titulo: "Culto às Quintas", horario: "20h", descricao: "Todas as quintas-feiras | Templo Principal" },
    { tipo: "recorrente", titulo: "Culto aos Domingos", horario: "18h", descricao: "Todos os domingos | Templo Principal" },
    { tipo: "recorrente", titulo: "Oração Diária", horario: "8h", descricao: "Todos os dias | Presencial na Igreja" },
    { tipo: "recorrente", titulo: "Oração Quarta-feira", horario: "5h", descricao: "Todas as quartas-feiras | Presencial na Igreja" },
    { tipo: "especial", data: "02/12", titulo: "Formatura do Rever", horario: "20h", descricao: "Templo Principal" },
    { tipo: "especial", data: "06/12", titulo: "Aviva Teens", horario: "18h", descricao: "Templo Principal" }
  ],
  contatos: [
    { nome: "Bruno Dos Santos", cargo: "Líder - Aviva Teens", numero: "+55 11 96354-4213" },
    { nome: "Caroline Ramos", cargo: "Líder - Aviva Teens", numero: "+55 11 96315-3635" },
    { nome: "Dejair", cargo: "Presbítero - Louvor e Adoração", numero: "+55 69 9381-6282" },
    { nome: "Fabiano", cargo: "Presbítero - Aviva Casais", numero: "+55 11 94736-5680" },
    { nome: "Juliane Lirio Farias", cargo: "Obreira - Aviva Kids", numero: "+55 11 99107-8595" },
    { nome: "Pr Will", cargo: "Pastor - Aviva Jovens", numero: "+55 11 98268-5622" },
    { nome: "Pra Tatiani", cargo: "Pastora - Aviva Jovens", numero: "+55 11 95984-4501" },
    { nome: "Rose Ribeiro", cargo: "Pastora - Aviva Kids", numero: "+55 11 98956-4020" },
    { nome: "Stefane", cargo: "Presbítera - Aviva Obreiros", numero: "+55 11 94069-6532" },
    { nome: "Vanessa Sede", cargo: "Presbítera - Aviva Casais", numero: "+55 11 97663-2641" }
  ]
};

// ================= FUNÇÕES DE ARQUIVO =================
async function loadData() {
  try {
    const raw = await fs.readFile(path.join(__dirname, 'data.json'), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.log("data.json não existe → criando com dados iniciais...");
    await saveData(initialData);
    return initialData;
  }
}

async function saveData(data) {
  await fs.writeFile(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));
}

// ================= ROTAS API =================
app.get('/api/data', async (req, res) => {
  try {
    const data = await loadData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar dados" });
  }
});

app.post('/api/versiculo', async (req, res) => {
  try {
    const data = await loadData();
    data.versiculo = req.body;
    await saveData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar versículo" });
  }
});

app.post('/api/palavra-semana', async (req, res) => {
  try {
    const data = await loadData();
    data.palavraSemana = req.body;
    await saveData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar palavra da semana" });
  }
});

app.post('/api/agenda', async (req, res) => {
  try {
    const data = await loadData();
    data.agenda = req.body;
    await saveData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar agenda" });
  }
});

app.post('/api/contatos', async (req, res) => {
  try {
    const data = await loadData();
    data.contatos = req.body;
    await saveData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar contatos" });
  }
});

// ================= ROTAS DE PÁGINA =================
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ================= INICIAR SERVIDOR =================
app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR RODANDO → http://localhost:${PORT}`);
  console.log(`📱 Página principal → http://localhost:${PORT}`);
  console.log(`⚙️  Painel Admin     → http://localhost:${PORT}/admin`);
});