// src/servicos/auth.js
import { ref } from 'vue'

const usuarioLogado = ref(JSON.parse(sessionStorage.getItem('usuarioLogado')) || null)

const usuariosIniciais = [
  { id: 1, usuario: 'admin', senha: '1234' },
  { id: 2, usuario: 'talita', senha: 'talita123' },
  { id: 3, usuario: 'denner', senha: 'denner123' },
  // { id: 4, usuario: 'aida', senha: 'aida123' },
  // { id: 5, usuario: 'ana', senha: 'ana123' },
]

// Verifica se os usuários já foram armazenados no sessionStorage
if (!sessionStorage.getItem('usuarios_app')) {
  // Caso não, armazena a lista de usuários no sessionStorage
  sessionStorage.setItem('usuarios_app', JSON.stringify(usuariosIniciais))
}

function login(usuarioDigitado, senhaDigitada) {
  // Obtém a lista de usuários do sessionStorage
  const usuarios = JSON.parse(sessionStorage.getItem('usuarios_app')) || []

  // Procura um usuário com as credenciais informadas
  const usuarioEncontrado = usuarios.find(
    (u) => u.usuario === usuarioDigitado && u.senha === senhaDigitada,
  )

  if (usuarioEncontrado) {
    // Se o usuário for encontrado, cria um objeto de usuário
    const user = {
      nome: usuarioEncontrado.usuario,
      token: 'mock-token-abc123', // Isso pode ser gerado dinamicamente
    }

    // Armazena o usuário logado no sessionStorage
    sessionStorage.setItem('usuarioLogado', JSON.stringify(user))

    // Define o usuário logado na aplicação (por exemplo, em um estado reativo)
    usuarioLogado.value = user

    // Retorna true para indicar que o login foi bem-sucedido
    return true
  } else {
    // Retorna false se as credenciais estiverem incorretas
    return false
  }
}
function logout() {
  usuarioLogado.value = null
  sessionStorage.removeItem('usuarioLogado') // remove do navegador
}

function isAuthenticated() {
  return usuarioLogado.value !== null
}

function getUsuario() {
  return usuarioLogado.value
}

export default {
  login,
  logout,
  isAuthenticated,
  getUsuario,
}
