export interface Question {
  id: string
  text: string
  options: string[]
  correctIndex: number
  difficulty: "easy" | "medium" | "hard"
}

export const questions: Question[] = [
  // --- INICIANTE (DADOS NORMAIS) ---
  
  // Cloud Computing - Iniciante
  {
    id: "cloud-easy-1",
    text: "O que é Computação em Nuvem?",
    options: [
      "Acesso a recursos de TI via internet",
      "Um software para prever o tempo",
      "Um tipo de monitor de alta resolução"
    ],
    correctIndex: 0,
    difficulty: "easy"
  },
  {
    id: "cloud-easy-2",
    text: "Qual destes é um exemplo de serviço em nuvem?",
    options: [
      "Google Drive",
      "Calculadora do Windows",
      "Paint"
    ],
    correctIndex: 0,
    difficulty: "easy"
  },
  {
    id: "cloud-easy-3",
    text: "O que significa SaaS?",
    options: [
      "Software as a Service",
      "System as a Server",
      "Storage as a System"
    ],
    correctIndex: 0,
    difficulty: "easy"
  },
  {
    id: "cloud-easy-4",
    text: "Qual é uma vantagem comum da computação em nuvem?",
    options: [
      "Escalar recursos conforme a necessidade",
      "Ter acesso offline garantido",
      "Não precisar de internet"
    ],
    correctIndex: 0,
    difficulty: "easy"
  },
  
  // Big Data - Iniciante
  {
    id: "bigdata-easy-1",
    text: "O que define Big Data?",
    options: [
      "Volume, Velocidade e Variedade de dados",
      "Um arquivo de texto muito grande",
      "Um banco de dados lento"
    ],
    correctIndex: 0,
    difficulty: "easy"
  },
  {
    id: "bigdata-easy-2",
    text: "Qual profissional analisa Big Data?",
    options: [
      "Cientista de Dados",
      "Web Designer",
      "Técnico de Impressora"
    ],
    correctIndex: 0,
    difficulty: "easy"
  },
  
  // Segurança - Iniciante
  {
    id: "sec-easy-1",
    text: "O que é uma senha forte?",
    options: [
      "Mistura de letras, números e símbolos",
      "Sua data de nascimento",
      "O nome do seu cachorro"
    ],
    correctIndex: 0,
    difficulty: "easy"
  },
  {
    id: "sec-easy-2",
    text: "O que é Phishing?",
    options: [
      "Tentativa de roubar dados via e-mail falso",
      "Um software de edição de fotos",
      "Um tipo de vírus de computador antigo"
    ],
    correctIndex: 0,
    difficulty: "easy"
  },
  {
    id: "sec-easy-3",
    text: "O que faz um Antivírus?",
    options: [
      "Detecta e remove softwares maliciosos",
      "Deixa a internet mais rápida",
      "Limpa a tela do computador"
    ],
    correctIndex: 0,
    difficulty: "easy"
  },

  // --- MÉDIO (DADOS CONFIDENCIAIS) ---

  // Cloud Computing - Médio
  {
    id: "cloud-med-1",
    text: "O que é IaaS?",
    options: [
      "Infrastructure as a Service",
      "Internet as a Service",
      "Information as a System"
    ],
    correctIndex: 0,
    difficulty: "medium"
  },
  {
    id: "cloud-med-2",
    text: "Qual modelo de nuvem combina nuvem pública e privada?",
    options: [
      "Nuvem Híbrida",
      "Nuvem Comunitária",
      "Nuvem Dedicada"
    ],
    correctIndex: 0,
    difficulty: "medium"
  },
  {
    id: "cloud-med-3",
    text: "Qual empresa é dona da plataforma Azure?",
    options: [
      "Microsoft",
      "Amazon",
      "Google"
    ],
    correctIndex: 0,
    difficulty: "medium"
  },

  // Big Data - Médio
  {
    id: "bigdata-med-1",
    text: "O que é Hadoop?",
    options: [
      "Um framework para processamento distribuído",
      "Um tipo de banco de dados relacional",
      "Um sistema operacional para servidores"
    ],
    correctIndex: 0,
    difficulty: "medium"
  },
  {
    id: "bigdata-med-2",
    text: "O que significa 'Mineração de Dados' (Data Mining)?",
    options: [
      "Descobrir padrões em grandes conjuntos de dados",
      "Recuperar arquivos deletados",
      "Criar backups de segurança"
    ],
    correctIndex: 0,
    difficulty: "medium"
  },

  // Segurança - Médio
  {
    id: "sec-med-1",
    text: "O que é um ataque DDoS?",
    options: [
      "Negação de serviço distribuída",
      "Roubo de dados diretos",
      "Injeção de código malicioso"
    ],
    correctIndex: 0,
    difficulty: "medium"
  },
  {
    id: "sec-med-2",
    text: "O que é Criptografia?",
    options: [
      "Técnica para codificar informações",
      "Um tipo de moeda virtual",
      "Um software de limpeza"
    ],
    correctIndex: 0,
    difficulty: "medium"
  },
  {
    id: "sec-med-3",
    text: "O que significa a sigla VPN?",
    options: [
      "Virtual Private Network",
      "Visual Protocol Network",
      "Virtual Public Network"
    ],
    correctIndex: 0,
    difficulty: "medium"
  },

  // --- DIFÍCIL (DADOS CRÍTICOS) ---

  // Cloud Computing - Difícil
  {
    id: "cloud-hard-1",
    text: "O que é 'Serverless Computing'?",
    options: [
      "Execução de código sem gerenciar servidores",
      "Computação sem uso de internet",
      "Servidores físicos desconectados"
    ],
    correctIndex: 0,
    difficulty: "hard"
  },
  {
    id: "cloud-hard-2",
    text: "Qual destes é um container orchestrator?",
    options: [
      "Kubernetes",
      "Docker Compose",
      "VirtualBox"
    ],
    correctIndex: 0,
    difficulty: "hard"
  },

  // Big Data - Difícil
  {
    id: "bigdata-hard-1",
    text: "O que é o conceito de 'Data Lake'?",
    options: [
      "Repositório centralizado de dados brutos",
      "Um banco de dados estruturado SQL",
      "Uma planilha Excel gigante"
    ],
    correctIndex: 0,
    difficulty: "hard"
  },
  {
    id: "bigdata-hard-2",
    text: "Qual a diferença entre ETL e ELT?",
    options: [
      "A ordem de transformação e carregamento",
      "O tipo de banco de dados usado",
      "A linguagem de programação"
    ],
    correctIndex: 0,
    difficulty: "hard"
  },

  // Segurança - Difícil
  {
    id: "sec-hard-1",
    text: "O que é um ataque 'Zero Day'?",
    options: [
      "Exploração de falha ainda não corrigida",
      "Um ataque que dura 24 horas",
      "Um vírus que apaga tudo no dia zero"
    ],
    correctIndex: 0,
    difficulty: "hard"
  },
  {
    id: "sec-hard-2",
    text: "O que é Ransomware?",
    options: [
      "Malware que sequestra dados e pede resgate",
      "Software que deixa o PC lento",
      "Programa que rouba senhas de banco"
    ],
    correctIndex: 0,
    difficulty: "hard"
  },
  {
    id: "sec-hard-3",
    text: "O que é Engenharia Social?",
    options: [
      "Manipulação psicológica para obter dados",
      "Construção de firewalls físicos",
      "Programação de redes sociais"
    ],
    correctIndex: 0,
    difficulty: "hard"
  }
]
