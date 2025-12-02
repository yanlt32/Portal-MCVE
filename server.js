

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const multer = require('multer');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;


// Adicione isto ANTES de tudo no server.js
const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000; // 10 minutos

// Função para manter o servidor ativo
function startKeepAlive() {
  setInterval(() => {
    console.log(`🔄 Keep-alive: ${new Date().toISOString()}`);
    
    // Opcional: fazer uma requisição interna
    fetch(`http://localhost:${PORT}/health`)
      .then(res => console.log('✅ Health check interno:', res.status))
      .catch(err => console.log('⚠️  Health check falhou:', err.message));
      
  }, KEEP_ALIVE_INTERVAL);
}

// ================= CONFIGURAÇÃO MULTER (UPLOAD DE VÍDEOS) =================
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fsSync.existsSync(uploadDir)) {
  fsSync.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = 'video-' + uniqueSuffix + ext;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limite
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'audio/mpeg', 'audio/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use vídeos MP4, WebM, OGG ou áudio MP3.'));
    }
  }
});

// ================= MIDDLEWARES =================
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));

// ================= DADOS INICIAIS =================
const initialData = {
  versiculo: {
    texto: "Bendito seja o Deus e Pai de nosso Senhor Jesus Cristo, que, segundo a sua grande misericórdia, nos gerou de novo para uma viva esperança, pela ressurreição de Jesus Cristo dentre os mortos.",
    referencia: "1 Pedro 1:3",
    dataAtualizacao: new Date().toISOString()
  },
  
  palavraSemana: {
    titulo: "O FIM É MELHOR DO QUE O COMEÇO",
    mensagem: `Introdução:
Vivemos em uma cultura que valoriza muito os começos, mas a Bíblia nos ensina que o fim é mais importante do que o início.

Versículo: Eclesiastes 7:8 - "Melhor é o fim das coisas do que o princípio delas; melhor é o paciente de espírito do que o altivo de espírito."

Explicação:
Deus está mais interessado em como terminamos do que em como começamos. Muitos começam bem, mas poucos terminam bem. A paciência, a perseverança e a fidelidade são essenciais para terminarmos bem a corrida.

Aplicação:
Não desanime se seu começo foi difícil. Não se acomode se seu início foi bom. Mantenha os olhos no alvo, na presença de Deus, na meta celestial. Continue fiel até o fim.

Conclusão:
O fim será melhor quando mantivermos nossa fé, nossa esperança e nosso amor em Cristo Jesus. Ele que começou a boa obra em nós há de completá-la até o dia de Cristo Jesus.`,
    dataAtualizacao: new Date().toISOString()
  },
  
  agenda: [
    {
      id: Date.now().toString(),
      tipo: "recorrente",
      titulo: "Culto de Oração",
      horario: "Quarta-feira às 20h",
      descricao: "Momento de intercessão pela igreja, família e nação.",
      icone: "fas fa-hands-praying"
    },
    {
      id: (Date.now() + 1).toString(),
      tipo: "recorrente",
      titulo: "Culto de Celebração",
      horario: "Domingo às 18h30",
      descricao: "Culto principal com louvor, palavra e celebração.",
      icone: "fas fa-church"
    },
    {
      id: (Date.now() + 2).toString(),
      tipo: "recorrente",
      titulo: "Escola Bíblica",
      horario: "Domingo às 17h",
      descricao: "Estudo sistemático da Palavra de Deus.",
      icone: "fas fa-book-bible"
    }
  ],
  
  contatos: [
    { id: 1, nome: "Bruno Dos Santos", cargo: "Líder - Aviva Teens", numero: "+55 11 96354-4213" },
    { id: 2, nome: "Caroline Ramos", cargo: "Líder - Aviva Teens", numero: "+55 11 96315-3635" },
    { id: 3, nome: "Dejair", cargo: "Presbítero - Louvor e Adoração", numero: "+55 69 9381-6282" },
    { id: 4, nome: "Fabiano", cargo: "Presbítero - Aviva Casais", numero: "+55 11 94736-5680" },
    { id: 5, nome: "Juliane Lirio Farias", cargo: "Obreira - Aviva Kids", numero: "+55 11 99107-8595" },
    { id: 6, nome: "Pr Will", cargo: "Pastor - Aviva Jovens", numero: "+55 11 98268-5622" },
    { id: 7, nome: "Pra Tatiani", cargo: "Pastora - Aviva Jovens", numero: "+55 11 95984-4501" },
    { id: 8, nome: "Rose Ribeiro", cargo: "Pastora - Aviva Kids", numero: "+55 11 98956-4020" },
    { id: 9, nome: "Stefane", cargo: "Presbítera - Aviva Obreiros", numero: "+55 11 94069-6532" },
    { id: 10, nome: "Vanessa Sede", cargo: "Presbítera - Aviva Casais", numero: "+55 11 97663-2641" }
  ],
  
  links: {
    oracao: "https://forms.gle/oracao",
    aconselhamento: "https://forms.gle/aconselhamento",
    visitante: "https://forms.gle/visitante",
    youtube: "https://www.youtube.com/c/CristoAVIVAEsperan%C3%A7a",
    facebook: "https://www.facebook.com/MCVEOFICIAL",
    instagram: "https://www.instagram.com/mcvesede",
    whatsapp: "https://wa.me/5511991167256"
  },
  
  eventosEspeciais: {
    ativo: true,
    titulo: "Campanha das Primícias",
    periodo: "Janeiro 2026",
    tema: "Consagrando o Primeiro ao Senhor",
    versiculo: {
      texto: "Honra ao SENHOR com os teus bens e com as primícias de toda a tua renda; e se encherão os teus celeiros abundantemente, e transbordarão de mosto os teus lagares.",
      referencia: "Provérbios 3:9-10"
    },
    descricao: "Venha consagrar o primeiro mês do ano ao Senhor! Uma semana especial de cultos e consagração para começarmos o ano na presença de Deus.",
    inscricoes: [],
    dataInicio: "2026-01-01",
    dataFim: "2026-01-31"
  },
  
  meditacaoDiaria: [
    {
      id: Date.now().toString(),
      titulo: "Paz para a Alma",
      duracao: "1 min",
      descricao: "Comece seu dia com paz interior e serenidade.",
      tipo: "youtube",
      url: "https://www.youtube.com/embed/0vrS1-MJus4",
      categoria: "Paz",
      data: new Date().toISOString().split('T')[0],
      views: 0
    },
    {
      id: (Date.now() + 1).toString(),
      titulo: "Renovação Espiritual", 
      duracao: "2 min",
      descricao: "Momento de renovação e conexão com Deus.",
      tipo: "youtube",
      url: "https://www.youtube.com/embed/0vrS1-MJus4",
      categoria: "Renovação",
      data: new Date().toISOString().split('T')[0],
      views: 0
    }
  ]
};

// ================= FUNÇÕES DE ARQUIVO =================
async function loadData() {
  try {
    const raw = await fs.readFile(path.join(__dirname, 'data.json'), 'utf8');
    const data = JSON.parse(raw);
    
    // Verificar e adicionar IDs se necessário
    if (!data.agenda.every(item => item.id)) {
      data.agenda = data.agenda.map((item, index) => ({
        ...item,
        id: item.id || (Date.now() + index).toString()
      }));
    }
    
    if (!data.contatos.every(item => item.id)) {
      data.contatos = data.contatos.map((item, index) => ({
        ...item,
        id: item.id || (index + 1)
      }));
    }
    
    return data;
  } catch (err) {
    console.log("data.json não encontrado → criando com dados iniciais...");
    await saveData(initialData);
    return initialData;
  }
}

async function saveData(data) {
  try {
    await fs.writeFile(
      path.join(__dirname, 'data.json'), 
      JSON.stringify(data, null, 2)
    );
    console.log("Dados salvos com sucesso");
  } catch (err) {
    console.error("Erro ao salvar dados:", err);
    throw err;
  }
}

// ================= ROTAS DO SERVICE WORKER E PWA =================
app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, 'public', 'sw.js'));
});

app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const manifest = {
    name: "AVIVA - Portal dos Membros",
    short_name: "AVIVA",
    description: "Portal do Ministério Cristo a Viva Esperança",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0f172a",
    theme_color: "#1e293b",
    icons: [
      {
        src: "/logo.jpeg",
        sizes: "192x192",
        type: "image/jpeg"
      },
      {
        src: "/logo.jpeg",
        sizes: "512x512",
        type: "image/jpeg"
      }
    ],
    categories: ["lifestyle", "religious"],
    lang: "pt-BR"
  };
  res.json(manifest);
});

// ================= ROTAS API =================

// GET todos os dados
app.get('/api/data', async (req, res) => {
  try {
    const data = await loadData();
    res.json(data);
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
    res.status(500).json({ error: "Erro ao carregar dados", details: err.message });
  }
});

// GET dados específicos
app.get('/api/palavra-semana', async (req, res) => {
  try {
    const data = await loadData();
    res.json(data.palavraSemana);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar palavra da semana" });
  }
});

app.get('/api/eventos-especiais', async (req, res) => {
  try {
    const data = await loadData();
    res.json(data.eventosEspeciais);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar eventos especiais" });
  }
});

app.get('/api/meditacao', async (req, res) => {
  try {
    const data = await loadData();
    res.json(data.meditacaoDiaria);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar meditação diária" });
  }
});

app.get('/api/agenda', async (req, res) => {
  try {
    const data = await loadData();
    res.json(data.agenda);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar agenda" });
  }
});

app.get('/api/contatos', async (req, res) => {
  try {
    const data = await loadData();
    res.json(data.contatos);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar contatos" });
  }
});

// POST para atualizar dados
app.post('/api/versiculo', async (req, res) => {
  try {
    const data = await loadData();
    data.versiculo = {
      ...req.body,
      dataAtualizacao: new Date().toISOString()
    };
    await saveData(data);
    res.json({ success: true, message: "Versículo atualizado com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar versículo" });
  }
});

app.post('/api/palavra-semana', async (req, res) => {
  try {
    const data = await loadData();
    data.palavraSemana = {
      ...req.body,
      dataAtualizacao: new Date().toISOString()
    };
    await saveData(data);
    res.json({ success: true, message: "Palavra da semana atualizada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar palavra da semana" });
  }
});

app.post('/api/agenda', async (req, res) => {
  try {
    const data = await loadData();
    data.agenda = req.body.map(item => ({
      ...item,
      id: item.id || Date.now().toString()
    }));
    await saveData(data);
    res.json({ success: true, message: "Agenda atualizada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar agenda" });
  }
});

app.post('/api/contatos', async (req, res) => {
  try {
    const data = await loadData();
    data.contatos = req.body.map((item, index) => ({
      ...item,
      id: item.id || (index + 1)
    }));
    await saveData(data);
    res.json({ success: true, message: "Contatos atualizados com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar contatos" });
  }
});

app.post('/api/links', async (req, res) => {
  try {
    const data = await loadData();
    data.links = req.body;
    await saveData(data);
    res.json({ success: true, message: "Links atualizados com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar links" });
  }
});

app.post('/api/eventos-especiais', async (req, res) => {
  try {
    const data = await loadData();
    data.eventosEspeciais = req.body;
    await saveData(data);
    res.json({ success: true, message: "Eventos especiais atualizados com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar eventos especiais" });
  }
});

// POST inscrições
app.post('/api/inscricoes', async (req, res) => {
  try {
    const data = await loadData();
    if (!data.eventosEspeciais.inscricoes) {
      data.eventosEspeciais.inscricoes = [];
    }
    
    const inscricao = {
      ...req.body,
      id: Date.now().toString(),
      dataInscricao: new Date().toISOString(),
      status: "pendente"
    };
    
    data.eventosEspeciais.inscricoes.push(inscricao);
    await saveData(data);
    
    res.json({ 
      success: true, 
      message: "Inscrição realizada com sucesso!",
      inscricao: inscricao
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar inscrição: " + err.message });
  }
});

// GET inscrições
app.get('/api/inscricoes', async (req, res) => {
  try {
    const data = await loadData();
    res.json(data.eventosEspeciais?.inscricoes || []);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar inscrições" });
  }
});

// POST meditação diária
app.post('/api/meditacao', async (req, res) => {
  try {
    const data = await loadData();
    data.meditacaoDiaria = req.body.map(item => ({
      ...item,
      id: item.id || Date.now().toString(),
      views: item.views || 0
    }));
    await saveData(data);
    res.json({ success: true, message: "Meditação diária atualizada com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao salvar meditação diária" });
  }
});

// POST upload de vídeo
app.post('/api/upload-video', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const data = await loadData();
    
    const novoVideo = {
      id: Date.now().toString(),
      titulo: req.body.titulo || "Vídeo sem título",
      duracao: req.body.duracao || "0 min",
      descricao: req.body.descricao || "",
      categoria: req.body.categoria || "Geral",
      tipo: "upload",
      url: '/uploads/' + req.file.filename,
      data: new Date().toISOString().split('T')[0],
      views: 0
    };

    if (!data.meditacaoDiaria) {
      data.meditacaoDiaria = [];
    }

    data.meditacaoDiaria.unshift(novoVideo); // Adiciona no início
    await saveData(data);

    res.json({ 
      success: true, 
      video: novoVideo,
      message: "Vídeo enviado com sucesso!" 
    });
  } catch (err) {
    console.error("Erro no upload:", err);
    res.status(500).json({ error: "Erro ao fazer upload do vídeo: " + err.message });
  }
});

// DELETE vídeo
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

// POST incrementar views do vídeo
app.post('/api/video/:id/view', async (req, res) => {
  try {
    const data = await loadData();
    const video = data.meditacaoDiaria.find(v => v.id == req.params.id);
    
    if (!video) {
      return res.status(404).json({ error: "Vídeo não encontrado" });
    }

    video.views = (video.views || 0) + 1;
    await saveData(data);

    res.json({ success: true, views: video.views });
  } catch (err) {
    res.status(500).json({ error: "Erro ao incrementar views" });
  }
});

// POST backup de dados
app.post('/api/backup', async (req, res) => {
  try {
    const data = await loadData();
    const backupDir = path.join(__dirname, 'backups');
    
    if (!fsSync.existsSync(backupDir)) {
      fsSync.mkdirSync(backupDir, { recursive: true });
    }
    
    const backupFile = path.join(backupDir, `backup-${Date.now()}.json`);
    await fs.writeFile(backupFile, JSON.stringify(data, null, 2));
    
    res.json({ 
      success: true, 
      message: "Backup criado com sucesso",
      file: backupFile 
    });
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar backup" });
  }
});

// GET lista de backups
app.get('/api/backups', async (req, res) => {
  try {
    const backupDir = path.join(__dirname, 'backups');
    
    if (!fsSync.existsSync(backupDir)) {
      return res.json([]);
    }
    
    const files = await fs.readdir(backupDir);
    const backups = files
      .filter(file => file.endsWith('.json'))
      .map(file => ({
        name: file,
        path: path.join(backupDir, file),
        size: fsSync.statSync(path.join(backupDir, file)).size
      }));
    
    res.json(backups);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar backups" });
  }
});

// ================= ROTAS DE PÁGINA =================
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/meditacao', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'meditacao.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Fallback para SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ================= TRATAMENTO DE ERROS =================
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: "Arquivo muito grande. Tamanho máximo: 100MB" });
    }
  }
  
  res.status(500).json({ 
    error: "Erro interno do servidor",
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ================= INICIAR SERVIDOR =================
async function startServer() {
  try {
    // Garantir que os dados iniciais existam
    await loadData();
    
    app.listen(PORT, () => {
      console.log(`\n🚀 SERVIDOR RODANDO NA PORTA ${PORT}`);
      console.log(`📱 Página principal → http://localhost:${PORT}`);
      console.log(`🧘 Meditação Diária → http://localhost:${PORT}/meditacao`);
      console.log(`⚙️  Painel Admin     → http://localhost:${PORT}/admin`);
      console.log(`📊 API disponível   → http://localhost:${PORT}/api/data`);
      console.log(`🩺 Health check     → http://localhost:${PORT}/health`);
      console.log(`🔄 Service Worker   → http://localhost:${PORT}/sw.js`);
      console.log(`📄 Manifest         → http://localhost:${PORT}/manifest.json`);
      console.log(`\n⚡ AVIVA App pronto para uso!`);
    });
  } catch (err) {
    console.error("Erro ao iniciar servidor:", err);
    process.exit(1);
  }
}
// ========== ROTAS PARA O CRON-JOB ==========

// Rota simples para o cron-job
app.get('/ping', (req, res) => {
  console.log(`✅ Ping recebido: ${new Date().toLocaleTimeString()}`);
  res.json({ 
    status: 'alive',
    timestamp: new Date().toISOString(),
    message: 'AVIVA Portal Online',
    uptime: process.uptime()
  });
});

// Rota de saúde mais completa
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    server: 'AVIVA Portal',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    requests: requestCount
  });
});

// Rota de status (para verificar manualmente)
app.get('/status', (req, res) => {
  res.json({
    online: true,
    lastPing: new Date().toISOString(),
    url: 'https://' + req.get('host'),
    endpoints: {
      ping: '/ping',
      health: '/health',
      main: '/',
      api: '/api/data'
    }
  });
});
// Iniciar servidor
startServer();