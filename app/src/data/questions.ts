export interface Question {
  id: string
  text: string
  options: string[]
  correctIndex: number
}

export const questions: Question[] = [
  // Cloud Computing
  {
    id: "cloud-1",
    text: "O que é Computação em Nuvem?",
    options: [
      "Acesso a recursos de TI via internet",
      "Um software para prever o tempo",
      "Um tipo de monitor de alta resolução"
    ],
    correctIndex: 0
  },
  {
    id: "cloud-2",
    text: "Qual destes é um exemplo de serviço em nuvem?",
    options: [
      "Google Drive",
      "Calculadora do Windows",
      "Paint"
    ],
    correctIndex: 0
  },
  {
    id: "cloud-3",
    text: "O que significa SaaS?",
    options: [
      "Software as a Service",
      "System as a Server",
      "Storage as a System"
    ],
    correctIndex: 0
  },
  
  // Big Data
  {
    id: "bigdata-1",
    text: "O que define Big Data?",
    options: [
      "Volume, Velocidade e Variedade de dados",
      "Um arquivo de texto muito grande",
      "Um banco de dados lento"
    ],
    correctIndex: 0
  },
  {
    id: "bigdata-2",
    text: "Qual profissional analisa Big Data?",
    options: [
      "Cientista de Dados",
      "Web Designer",
      "Técnico de Impressora"
    ],
    correctIndex: 0
  },
  
  // Segurança Digital
  {
    id: "sec-1",
    text: "O que é uma senha forte?",
    options: [
      "Mistura de letras, números e símbolos",
      "Sua data de nascimento",
      "O nome do seu cachorro"
    ],
    correctIndex: 0
  },
  {
    id: "sec-2",
    text: "O que é Phishing?",
    options: [
      "Tentativa de roubar dados via e-mail falso",
      "Um software de edição de fotos",
      "Um tipo de vírus de computador antigo"
    ],
    correctIndex: 0
  },
  {
    id: "sec-3",
    text: "O que faz um Antivírus?",
    options: [
      "Detecta e remove softwares maliciosos",
      "Deixa a internet mais rápida",
      "Limpa a tela do computador"
    ],
    correctIndex: 0
  },
  {
    id: "sec-4",
    text: "O que é Backup?",
    options: [
      "Cópia de segurança dos dados",
      "Um botão de reiniciar",
      "A parte de trás do computador"
    ],
    correctIndex: 0
  },
  {
    id: "sec-5",
    text: "O que é Firewall?",
    options: [
      "Sistema que bloqueia acessos não autorizados",
      "Uma parede à prova de fogo",
      "Um programa para queimar CDs"
    ],
    correctIndex: 0
  },

  // Cloud extra
  {
    id: "cloud-4",
    text: "Qual vantagem comum da computação em nuvem?",
    options: [
      "Escalar recursos conforme a necessidade",
      "Obrigar uso de apenas um dispositivo",
      "Impedir acesso remoto a sistemas"
    ],
    correctIndex: 0
  },
  {
    id: "cloud-5",
    text: "Qual modelo de nuvem é compartilhado por várias empresas?",
    options: [
      "Nuvem Pública",
      "Nuvem Privada",
      "Nuvem Local"
    ],
    correctIndex: 0
  },

  // Big Data extra
  {
    id: "bigdata-3",
    text: "Qual ferramenta é muito usada para processar grandes volumes de dados?",
    options: [
      "Apache Spark",
      "Bloco de Notas",
      "Gerenciador de Tarefas"
    ],
    correctIndex: 0
  },
  {
    id: "bigdata-4",
    text: "Por que Big Data é importante para empresas?",
    options: [
      "Apoiar decisões com base em dados",
      "Substituir todos os funcionários",
      "Eliminar a necessidade de segurança"
    ],
    correctIndex: 0
  },

  // Segurança extra
  {
    id: "sec-6",
    text: "O que é Autenticação em Dois Fatores (2FA)?",
    options: [
      "Uso de duas formas de verificação de identidade",
      "Uso de duas senhas iguais",
      "Uso de dois computadores ao mesmo tempo"
    ],
    correctIndex: 0
  },
  {
    id: "sec-7",
    text: "Qual atitude ajuda a evitar golpes online?",
    options: [
      "Desconfiar de links desconhecidos",
      "Clicar rápido em qualquer promoção",
      "Compartilhar senhas com amigos"
    ],
    correctIndex: 0
  }
]
