const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const multer = require('multer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// ================= CONFIGURAÇÃO MULTER (UPLOAD DE VÍDEOS) =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'public', 'uploads');
    // Criar diretório se não existir
    if (!fsSync.existsSync(uploadDir)) {
      fsSync.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limite
  },
  fileFilter: function (req, file, cb) {
    // Aceitar apenas vídeos
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de vídeo são permitidos!'));
    }
  }
});

// ================= MIDDLEWARES =================
app.use(cors());
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
    { tipo: "recorrente", titulo: "Oração Quarta-feira", horario: "5h", descricao: "Todas as quartas-feiras | Presencial na Igreja" }
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
  ],
  links: {
    oracao: "https://forms.gle/SEU_LINK_ORACAO",
    aconselhamento: "https://forms.gle/SEU_LINK_ACONSELHAMENTO",
    visitante: "https://forms.gle/SEU_LINK_VISITANTE",
    youtube: "https://www.youtube.com/c/CristoAVIVAEsperan%C3%A7a/streams"
  },
  eventosEspeciais: {
    ativo: true,
    titulo: "Campanha das Primícias",
    periodo: "01 a 12 de Janeiro de 2026",
    tema: "2026 ANO APOSTÓLICO CONECTANDO AS GERAÇÕES",
    versiculo: {
      texto: "E o que de mim, entre muitas testemunhas, ouviste, confia-o a homens fiéis, que sejam idôneos para também ensinarem os outros.",
      referencia: "2 Timóteo 2:1,2"
    },
    descricao: "Venha semear os seus primeiros dias do ano, e colher um ano de MILAGRES e VITORIAS.",
    inscricoes: []
  },
  meditacaoDiaria: [
    {
      id: 1,
      titulo: "Paz para a Alma",
      duracao: "1 min",
      descricao: "Comece seu dia com paz interior e serenidade.",
      tipo: "youtube",
      url: "https://www.youtube.com/embed/0vrS1-MJus4",
      categoria: "Paz",
      data: "2024-01-15"
    },
    {
      id: 2,
      titulo: "Renovação Espiritual", 
      duracao: "2 min",
      descricao: "Momento de renovação e conexão com Deus.",
      tipo: "youtube",
      url: "https://www.youtube.com/embed/0vrS1-MJus4",
      categoria: "Renovação",
      data: "2024-01-16"
    }
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

app.post('/api/links', async (req, res) => {
  try {
    const data = await loadData();
    data.links = req.body;
    await saveData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar links" });
  }
});

app.post('/api/eventos-especiais', async (req, res) => {
  try {
    const data = await loadData();
    data.eventosEspeciais = req.body;
    await saveData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar eventos especiais" });
  }
});

app.post('/api/inscricoes', async (req, res) => {
  try {
    const data = await loadData();
    data.eventosEspeciais.inscricoes.push({
      ...req.body,
      dataInscricao: new Date().toISOString(),
      id: Date.now().toString()
    });
    await saveData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar inscrição" });
  }
});

// ROTA DE UPLOAD DE VÍDEOS
app.post('/api/upload-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const data = await loadData();
    
    const novoVideo = {
      id: Date.now(),
      titulo: req.body.titulo,
      duracao: req.body.duracao,
      descricao: req.body.descricao,
      categoria: req.body.categoria,
      tipo: "upload",
      url: '/uploads/' + req.file.filename,
      data: new Date().toISOString().split('T')[0]
    };

    if (!data.meditacaoDiaria) {
      data.meditacaoDiaria = [];
    }

    data.meditacaoDiaria.push(novoVideo);
    await saveData(data);

    res.json({ 
      success: true, 
      video: novoVideo,
      message: "Vídeo enviado com sucesso!" 
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao fazer upload do vídeo: " + err.message });
  }
});

app.post('/api/meditacao', async (req, res) => {
  try {
    const data = await loadData();
    data.meditacaoDiaria = req.body;
    await saveData(data);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar meditação diária" });
  }
});

// Rota para deletar vídeo
app.delete('/api/video/:id', async (req, res) => {
  try {
    const data = await loadData();
    const videoIndex = data.meditacaoDiaria.findIndex(v => v.id == req.params.id);
    
    if (videoIndex === -1) {
      return res.status(404).json({ error: "Vídeo não encontrado" });
    }

    const video = data.meditacaoDiaria[videoIndex];
    
    // Deletar arquivo físico se for upload
    if (video.tipo === 'upload' && video.url) {
      const filePath = path.join(__dirname, 'public', video.url);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.log("Arquivo não encontrado para deletar:", filePath);
      }
    }

    data.meditacaoDiaria.splice(videoIndex, 1);
    await saveData(data);

    res.json({ success: true, message: "Vídeo deletado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao deletar vídeo: " + err.message });
  }
});

// ================= ROTAS DE PÁGINA =================
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/meditacao', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'meditacao-diaria.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ================= INICIAR SERVIDOR =================
app.listen(PORT, () => {
  console.log(`🚀 SERVIDOR RODANDO → http://localhost:${PORT}`);
  console.log(`📱 Página principal → http://localhost:${PORT}`);
  console.log(`🧘 Meditação Diária → http://localhost:${PORT}/meditacao`);
  console.log(`⚙️  Painel Admin     → http://localhost:${PORT}/admin`);
});