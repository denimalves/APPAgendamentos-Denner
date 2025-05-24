<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md" style="width: 300px">
      <q-card-section>
        <div class="text-h6">Login</div>
      </q-card-section>

      <q-card-section>
        <form @submit.prevent="entrar">
          <q-input v-model="usuario" label="Usuário" autocomplete="username" />
          <q-input
            v-model="senha"
            label="Senha"
            type="password"
            autocomplete="current-password"
            class="q-mt-md"
          />
          <q-card-actions align="center" class="q-mt-md">
            <q-btn label="Entrar" color="primary" @click="entrar" />
          </q-card-actions>
        </form>
      </q-card-section>
      <p>Obs: Para consultar os agendamentos é necessário fazer login</p>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import autenticar from 'src/servicos/autenticar'

const usuario = ref('')
const senha = ref('')
const router = useRouter()

function entrar() {
  const sucesso = autenticar.login(usuario.value, senha.value)
  if (sucesso) {
    router.push({ name: 'agendamentos' }) // Redireciona para a home
  } else {
    alert('Usuário ou senha inválidos')
  }
}
</script>
